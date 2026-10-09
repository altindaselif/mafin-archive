/*
 * Yayın tarihlerini TVMaze'den çeker ve eksik olanları doldurur.
 *
 * NEDEN: Her bölüm özeti eklenirken `airDate` elle giriliyordu — TVMaze'in
 * sayfasından okunup kopyalanıyordu. Sıkıcı olmasının yanında hataya da
 * açık: 270 ile 271 bir kez birbirinin tarihini ve numarasını almış, hata
 * aylarca sitede durmuş. Bu veri zaten kamuya açık bir API'den geliyor,
 * elle girilmesi için hiçbir sebep yok.
 *
 * EŞLEME: Arşiv kesintisiz numaralama kullanıyor (1…611+), TVMaze ise
 * sezon/bölüm (S3E134). İkisini bağlayan kural ölçülerek bulundu:
 *
 *     arşivdeki N numaralı bölüm  =  TVMaze listesindeki N. kayıt
 *
 * 611 kaydın tamamında doğrulandı. Ama bu eşleme TVMaze'in liste sırasına
 * bağlı: oraya sonradan araya bir bölüm eklenirse N'den sonrası bir kayar
 * ve eşleme sessizce yanlışlaşır. O yüzden script her çalıştığında ELDEKİ
 * tarihleri de kontrol ediyor; sapma çoksa hiçbir şey yazmadan duruyor.
 * Sessizce bozulmasın diye.
 *
 * Kullanım:
 *   node scripts/sync-airdates.mjs          doldur ve yaz
 *   node scripts/sync-airdates.mjs --dry    sadece ne yapacağını söyle
 *
 * Build'e BAĞLI DEĞİL: bilerek. Build sırasında koşsaydı tarihler git'e
 * hiç düşmezdi, diff'te görünmezdi ve TVMaze çöktüğü gün site tarihsiz
 * yayınlanırdı. Elle (ya da zamanlanmış bir görevle) çalışır, çıktısı
 * normal bir commit olur.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const TVMAZE_SHOW = 74973; // Sueños de libertad
const API = `https://api.tvmaze.com/shows/${TVMAZE_SHOW}/episodes`;

/* Elimizdeki tarihle TVMaze'in verdiği kaç kayıtta çelişirse eşlemenin
   kendisinden şüphe edilir. Birkaç kayıt TVMaze'in sonradan yaptığı bir
   düzeltme olabilir; onlarca kayıt "liste kaydı" demektir. */
const MAX_DRIFT = 5;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const EPISODES_DIR = join(root, "src/data/episodes");
const SEASON_INFO = join(root, "src/data/seasonInfo.js");

const dry = process.argv.includes("--dry");

/* ── TVMaze ─────────────────────────────────────────────────────────── */

const res = await fetch(API, { headers: { accept: "application/json" } });
if (!res.ok) {
  console.error(`TVMaze ${res.status} ${res.statusText} — hiçbir şey yazılmadı.`);
  process.exit(1);
}
const remote = await res.json();
if (!Array.isArray(remote) || remote.length === 0) {
  console.error("TVMaze boş liste döndü — hiçbir şey yazılmadı.");
  process.exit(1);
}

/* Liste sırası = arşivin numarası. TVMaze kayıtları zaten kronolojik
   veriyor ama ona güvenmek yerine tarihe göre sıralıyoruz: aynı güne iki
   bölüm düşerse sezon/bölüm numarası ikincil anahtar. */
const ordered = [...remote].sort(
  (a, b) =>
    String(a.airdate).localeCompare(String(b.airdate)) ||
    a.season - b.season ||
    a.number - b.number,
);
const dateOf = new Map(ordered.map((e, i) => [i + 1, e.airdate]));

/* ── Eldeki kayıtlar ────────────────────────────────────────────────── */

const files = readdirSync(EPISODES_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

const records = files.map((f) => {
  const path = join(EPISODES_DIR, f);
  return { file: f, path, data: JSON.parse(readFileSync(path, "utf8")) };
});

const missing = []; // tarihi yok, doldurulacak
const drift = []; // tarihi var ama TVMaze'le çelişiyor
const unknown = []; // TVMaze'de henüz yok (yayınlanmamış)

for (const r of records) {
  const n = r.data.number;
  const remoteDate = dateOf.get(n);
  if (!remoteDate) {
    unknown.push(n);
  } else if (!r.data.airDate) {
    missing.push({ ...r, date: remoteDate });
  } else if (r.data.airDate !== remoteDate) {
    drift.push({ number: n, local: r.data.airDate, remote: remoteDate });
  }
}

if (drift.length > MAX_DRIFT) {
  console.error(
    `DUR: ${drift.length} kayıtta tarih çelişiyor (eşik ${MAX_DRIFT}).\n` +
      `Bu, TVMaze listesine araya bölüm eklendiği ve numara eşlemesinin\n` +
      `kaydığı anlamına gelir. Hiçbir şey yazılmadı — eşlemeyi elden\n` +
      `geçirmek gerekiyor.\n\nÖrnekler:`,
  );
  for (const d of drift.slice(0, 10)) {
    console.error(`  bölüm ${d.number}: yerel ${d.local} · TVMaze ${d.remote}`);
  }
  process.exit(1);
}

/* ── Sezon aralıkları ───────────────────────────────────────────────── */

/* seasonInfo.js'teki tablo elle güncelleniyordu ve bayatlıyordu: 3. sezon
   612'de biter yazıyordu, oysa sezon devam ediyordu. Aynı listeden
   türetilebilen bir şeyin elle yazılmasına gerek yok. */
const seasonRows = [];
for (const [i, e] of ordered.entries()) {
  const index = i + 1;
  const row = seasonRows.at(-1);
  if (!row || row.season !== e.season) {
    seasonRows.push({
      season: e.season,
      firstEpisode: index,
      lastEpisode: index,
      year: String(e.airdate).slice(0, 4),
    });
  } else {
    row.lastEpisode = index;
  }
}

const seasonBlock =
  "export const SEASON_RANGES = [\n" +
  seasonRows
    .map(
      (r) =>
        `  { season: ${r.season}, firstEpisode: ${r.firstEpisode}, ` +
        `lastEpisode: ${r.lastEpisode}, year: "${r.year}" },`,
    )
    .join("\n") +
  "\n];";

const today = new Date().toISOString().slice(0, 10);
const infoSrc = readFileSync(SEASON_INFO, "utf8");
let infoNext = infoSrc.replace(
  /export const SEASON_RANGES = \[[\s\S]*?\n\];/,
  seasonBlock,
);
infoNext = infoNext.replace(
  /Last synced: \d{4}-\d{2}-\d{2}, \d+ episodes\./,
  `Last synced: ${today}, ${ordered.length} episodes.`,
);
const seasonChanged = infoNext !== infoSrc;

/* ── Yaz ────────────────────────────────────────────────────────────── */

if (!dry) {
  for (const m of missing) {
    /* Alan sırası korunuyor: airDate kayıtların sonunda duruyor, yeni
       alan eklemek diff'i gereksiz büyütür. JSON.stringify(…, 2) + "\n"
       mevcut 611 dosyanın tamamıyla birebir aynı çıktı veriyor. */
    const next = { ...m.data, airDate: m.date };
    writeFileSync(m.path, JSON.stringify(next, null, 2) + "\n");
  }
  if (seasonChanged) writeFileSync(SEASON_INFO, infoNext);
}

/* ── Özet ───────────────────────────────────────────────────────────── */

const tag = dry ? "[--dry] " : "";
console.log(`${tag}TVMaze: ${ordered.length} bölüm · son yayın ${ordered.at(-1).airdate}`);
console.log(`${tag}arşiv : ${records.length} kayıt`);
console.log(
  `${tag}tarih doldurulan: ${missing.length}` +
    (missing.length
      ? `  (${missing
          .slice(0, 8)
          .map((m) => `${m.data.number}→${m.date}`)
          .join(", ")}${missing.length > 8 ? ", …" : ""})`
      : ""),
);
if (drift.length) {
  console.log(
    `${tag}ÇELİŞEN ${drift.length} tarih ÜZERİNE YAZILMADI — elle bakılmalı:`,
  );
  for (const d of drift) {
    console.log(`  bölüm ${d.number}: yerel ${d.local} · TVMaze ${d.remote}`);
  }
}
if (unknown.length) {
  console.log(
    `${tag}TVMaze'de henüz yok: ${unknown.length} bölüm (${unknown.slice(0, 8).join(", ")}${unknown.length > 8 ? ", …" : ""})`,
  );
}
console.log(
  `${tag}sezon tablosu: ${seasonChanged ? "güncellendi" : "değişiklik yok"}  ` +
    seasonRows
      .map((r) => `S${r.season} ${r.firstEpisode}–${r.lastEpisode}`)
      .join(" · "),
);
