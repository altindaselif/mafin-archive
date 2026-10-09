/*
 * Kıyafet kayıtlarını dosya adlarından üretir.
 *
 * NEDEN: katalog 100'den fazla kıyafetten oluşacak ve her birinin kaydı
 * üç bilgiden ibaret — karakter, sezon, sıra. Üçü de dosya adında yazıyor,
 * yani elle JSON yazmak yüz kere aynı şeyi kopyalamak olurdu.
 *
 * BEKLENEN DOSYA ADI:
 *
 *     marta-s1-01.webp      karakter-sezon-sıra
 *     fina-s2-07.webp
 *
 * Sıra numarası kataloğu hazırlayanın numaralaması; başka bir sıra bilgisi
 * yok (bir kıyafet bir sürü bölümde göründüğü için bölüm numarası
 * tutulmuyor — gerekçesi src/data/outfits.js'te).
 *
 * Kullanım:
 *   node scripts/import-outfits.mjs <görsel-klasörü>   gerçek görsellerden
 *   node scripts/import-outfits.mjs --sample 12        yer tutucu üret
 *   ... --dry                                          yazmadan göster
 *
 * Gerçek görseller R2'ye `outfits/` klasörüne yüklenir; kayda yalnızca
 * dosya yolu yazılır, tam adresi site kendisi kuruyor (src/lib/photos.js).
 */
import { readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(root, "src/data/outfits");

const argv = process.argv.slice(2);
const dry = argv.includes("--dry");
const sampleIdx = argv.indexOf("--sample");
const sampleCount = sampleIdx >= 0 ? Number(argv[sampleIdx + 1] || 12) : 0;
const sourceDir = argv.find((a) => !a.startsWith("--") && a !== String(sampleCount));

const NAME = /^(marta|fina)-s(\d+)-(\d+)$/i;
const IMAGE = /\.(webp|jpe?g|png|avif)$/i;

/* Kayıt adı dosya adının aynısı: sıralama ve kimlik tek yerden geliyor,
   ayrıca aynı görseli iki kez içe almak ikinci bir kayıt üretmiyor. */
const record = (character, season, order, photo, sample) => ({
  file: `${character}-s${season}-${String(order).padStart(2, "0")}.json`,
  data: {
    ...(sample ? { _sample: true } : {}),
    character,
    season,
    order,
    photo,
  },
});

const records = [];

if (sampleCount > 0) {
  /* Yer tutucular: Galería'nın örnek verisiyle aynı kaynak (picsum) ve
     aynı işaret (`_sample: true`), çünkü ikisi de yayından önce aynı
     listede silinecek — bkz. LAUNCH-CHECKLIST.md. 3:4 dikey, ızgaradaki
     çerçeveyle aynı oran. */
  for (const character of ["marta", "fina"]) {
    for (const season of [1, 2]) {
      for (let order = 1; order <= sampleCount; order++) {
        const seed = `mafin-${character}-s${season}-${order}`;
        records.push(
          record(
            character,
            season,
            order,
            `https://picsum.photos/seed/${seed}/900/1200`,
            true,
          ),
        );
      }
    }
  }
} else if (sourceDir) {
  const files = readdirSync(sourceDir).filter((f) => IMAGE.test(f));
  const skipped = [];
  for (const f of files.sort()) {
    const stem = basename(f).replace(IMAGE, "");
    const m = stem.match(NAME);
    if (!m) {
      skipped.push(f);
      continue;
    }
    const [, character, season, order] = m;
    records.push(
      record(
        character.toLowerCase(),
        Number(season),
        Number(order),
        `outfits/${f}`,
        false,
      ),
    );
  }
  if (skipped.length) {
    console.error(
      `Adı beklenen biçimde olmayan ${skipped.length} dosya ATLANDI ` +
        `(karakter-sezon-sıra, örn. marta-s1-01.webp):`,
    );
    for (const f of skipped.slice(0, 10)) console.error(`  ${f}`);
    if (skipped.length > 10) console.error(`  … ve ${skipped.length - 10} tane daha`);
  }
} else {
  console.error(
    "Ne klasör ne --sample verildi.\n" +
      "  node scripts/import-outfits.mjs <görsel-klasörü>\n" +
      "  node scripts/import-outfits.mjs --sample 12",
  );
  process.exit(1);
}

if (records.length === 0) {
  console.error("Üretilecek kayıt yok — hiçbir şey yazılmadı.");
  process.exit(1);
}

/* Aynı karakter-sezon-sıra üçlüsü iki kez gelirse sessizce biri diğerini
   ezerdi. Bunu hata saymak doğru: muhtemelen dosya adı yanlış yazılmış. */
const seen = new Set();
const clashes = records.filter((r) => (seen.has(r.file) ? true : (seen.add(r.file), false)));
if (clashes.length) {
  console.error("Aynı ada sahip kayıtlar var, dosya adlarını kontrol et:");
  for (const c of clashes) console.error(`  ${c.file}`);
  process.exit(1);
}

/* Yalnızca örnek kayıtlar temizlenir. Gerçek kayıtlara dokunulmuyor:
   bu script tekrar tekrar çalıştırılabilir olmalı ve ikinci çalıştırma
   elle düzeltilmiş bir kaydı silmemeli. */
const existing = readdirSync(OUT_DIR, { withFileTypes: true })
  .filter((d) => d.isFile() && d.name.endsWith(".json"))
  .map((d) => d.name);
const staleSamples = existing.filter((f) => {
  try {
    return JSON.parse(readFileSync(join(OUT_DIR, f), "utf8"))._sample === true;
  } catch {
    return false;
  }
});

if (!dry) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const f of staleSamples) unlinkSync(join(OUT_DIR, f));
  for (const r of records) {
    writeFileSync(join(OUT_DIR, r.file), JSON.stringify(r.data, null, 2) + "\n");
  }
}

const tag = dry ? "[--dry] " : "";
const byBucket = {};
for (const r of records) {
  const k = `${r.data.character} S${r.data.season}`;
  byBucket[k] = (byBucket[k] ?? 0) + 1;
}
console.log(`${tag}silinen eski örnek : ${staleSamples.length}`);
console.log(`${tag}yazılan kayıt      : ${records.length}`);
for (const [k, n] of Object.entries(byBucket)) {
  console.log(`${tag}  ${k.padEnd(10)} ${n}`);
}
