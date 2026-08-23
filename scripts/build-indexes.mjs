/*
 * Kaynak JSON'lardan iki hafif indeks üretir.
 *
 * NEDEN: Home sayfası "günün sözü" ve "tal día como hoy" için episodes.js
 * (408 KB) ve quotes.js (96 KB) dosyalarının TAMAMINI import ediyordu — ama
 * içlerinden sadece birkaç alanı kullanıyor. Bu 504 KB ana bundle'a giriyor,
 * yani ana sayfaya giren herkes indiriyor ve JS parse edilene kadar sayfadaki
 * hiçbir resim yüklenmeye başlamıyor.
 *
 * Bu script aynı veriden sadece gerekli kısmı çıkarıyor (~87 KB).
 *
 * Kaynak JSON'lardan türetilir — elle düzenlenmez. package.json'daki
 * "prebuild" / "predev" kancalarıyla otomatik çalışır.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readAll = (dir) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(root, dir, f), "utf8")));

const episodes = readAll("src/data/episodes");
const quotes = readAll("src/data/quotes");

/* ── "Tal día como hoy" ──────────────────────────────────────────────
 * Yılda 366 gün var, yani her gün için cevap önceden hesaplanabilir.
 * Aynı ay-güne düşen bölümlerden EN ESKİSİ kazanır (en büyük yıldönümü).
 * Tarayıcı artık 616 kayıt taramıyor, tek anahtarla tabloya bakıyor. */
/* `noMafin` işaretli bölümler bu tabloya GİRMEZ. Ana sayfadaki
   "tal día como hoy" o günün Mafin anını kutluyor; Mafin'in geçmediği
   bir bölümü oraya koymak amacına ters.
   Rehberde duruyorlar — oradan silmek 96'dan 98'e atlamak olurdu. */
const hasMafin = (e) => e.noMafin !== true;

const days = {};
for (const e of episodes) {
  if (!e.airDate || !hasMafin(e)) continue;
  const mmdd = e.airDate.slice(5);
  const prev = days[mmdd];
  if (!prev || e.airDate < prev.d) {
    days[mmdd] = { d: e.airDate, n: e.number, t: e.title };
  }
}
// `d` sadece "en eski"yi seçmek içindi; dışarıya yıl olarak veriyoruz
for (const k of Object.keys(days)) {
  days[k] = { n: days[k].n, y: Number(days[k].d.slice(0, 4)), t: days[k].t };
}

/* ── Stats sayacı ────────────────────────────────────────────────────
 * "Kaç bölüm yayınlandı" bugüne bağlı, build'de dondurulamaz — yarın
 * yanlış olur. O yüzden tarihleri gönderip saymayı tarayıcıya bırakıyoruz.
 * Tarihsiz bölümler her zaman sayılır (eski davranış korunuyor). */
const airDates = episodes.filter((e) => e.airDate).map((e) => e.airDate).sort();
const noDateCount = episodes.length - airDates.length;

/* ── Günün sözü havuzu ───────────────────────────────────────────────
 * Tek kişilik replikler (diyaloglar quotes sayfasının script düzenini
 * gerektiriyor) ve karta sığacak kadar kısa olanlar. İspanyolca metin
 * referans uzunluk. Süzme build'de yapılıyor; hangi alıntının seçileceği
 * tarihe bağlı olduğu için o karar tarayıcıda kalıyor. */
const DAILY_MAX_LENGTH = 160;
const quotePool = quotes
  .filter((q) => q.speaker !== "Mafin" && (q.text?.es ?? "").length <= DAILY_MAX_LENGTH)
  .sort((a, b) => a.episode - b.episode || a.number - b.number)
  .map((q) => ({ speaker: q.speaker, episode: q.episode, text: q.text }));

/* ── Bölüm meta indeksi (Vídeos + Galería) ───────────────────────────
 * Bu iki sayfa episodes.js'in TAMAMINI (409 KB) import ediyordu ama
 * sadece başlık ve mood kullanıyorlar. Bölüm açıklamaları tek başına
 * 308 KB — yani verinin dörtte üçü — ve onlara yalnızca Guía'nın
 * ihtiyacı var. Sezon number'dan seasonOf() ile türediği için saklanmıyor.
 *
 * home.json'un aksine bu dosya fetch edilmiyor, import ediliyor: Vídeos
 * ve Galería zaten lazy chunk'lar, 62 KB oraya girince ana sayfayı
 * etkilemiyor — ve yükleniyor durumu yönetmeye gerek kalmıyor. */
const episodeMeta = {};
for (const e of episodes) {
  episodeMeta[e.number] = { t: e.title, m: e.moods ?? [] };
}

const kb = (n) => (n / 1024).toFixed(1);

const homeJson = JSON.stringify({ days, airDates, noDateCount, quotePool });
mkdirSync(join(root, "public/data"), { recursive: true });
writeFileSync(join(root, "public/data/home.json"), homeJson);

const metaJson = JSON.stringify(episodeMeta);
mkdirSync(join(root, "src/data/generated"), { recursive: true });
writeFileSync(join(root, "src/data/generated/episodeMeta.json"), metaJson);

console.log(
  `home.json         ${kb(homeJson.length).padStart(6)} KB  ` +
    `(${Object.keys(days).length} gün · ${airDates.length} tarih · ${quotePool.length} alıntı)\n` +
    `episodeMeta.json  ${kb(metaJson.length).padStart(6)} KB  ` +
    `(${episodes.length} bölüm · başlık + mood)`
);
