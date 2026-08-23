/*
 * Sitenin sunucu tarafı.
 *
 * İki iş yapıyor: R2'deki medyayı servis etmek ve Fandom formunun
 * gönderimlerini almak. Statik dosyalar (HTML, JS, CSS, yerel resimler)
 * buraya hiç uğramıyor — Cloudflare onları doğrudan servis ediyor.
 *
 * ── Medya sunucusu ──
 *
 * Fotoğraf ve videolar Cloudflare R2'de duruyor. Eskiden tarayıcı onları
 * doğrudan `pub-*.r2.dev` adresinden çekiyordu — Cloudflare'in geliştirme
 * adresi. O adres hız sınırlı, önbelleksiz ve Türkiye'den kararsız
 * çalışıyordu: aynı fotoğraf bazen açılıyor bazen açılmıyordu.
 *
 * Site Cloudflare'e taşınınca R2 kovaları doğrudan bu Worker'a bağlanabildi.
 * Artık medya sitenin kendi adresinden geliyor (`/media/...`), r2.dev hiç
 * devreye girmiyor: kararsızlık da, hız sınırı da yok, üstelik Cloudflare'in
 * kendi önbelleği devreye giriyor.
 *
 * Statik dosyalar (HTML, JS, CSS, yerel resimler) bu koda hiç uğramıyor —
 * Cloudflare onları doğrudan servis ediyor. Buraya yalnızca eşleşmeyen
 * yollar düşüyor: /media/* ve React Router'ın çözdüğü sayfa adresleri.
 */

import { handleFandom } from "./fandom.js";

const BUCKETS = {
  videos: "VIDEOS",
  photos: "PHOTOS",
};

/* Medya dosyaları aynı adla değişmiyor (yeni fotoğraf = yeni ad), o yüzden
   uzun önbellek güvenli. Bir dosyanın üstüne yazılırsa yayılması bir hafta
   sürer — nadiren olan bir şey, karşılığında her ziyaret için tasarruf. */
const MEDIA_CACHE = "public, max-age=604800";

async function serveMedia(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  // /media/<tür>/<dosya yolu>
  const [, , kind, ...rest] = url.pathname.split("/");
  const bucket = env[BUCKETS[kind] ?? ""];
  if (!bucket || rest.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const key = decodeURIComponent(rest.join("/"));

  // `range`: video oynatma parça parça istek atar, bu olmadan sarma çalışmaz.
  // `onlyIf`: tarayıcı elindeki sürümü sorarsa 304 dönebilelim.
  const object = await bucket.get(key, {
    range: request.headers,
    onlyIf: request.headers,
  });

  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers); // content-type, content-encoding…
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", MEDIA_CACHE);

  // Gövde yoksa koşullu istek eşleşmiş demektir: içerik değişmemiş.
  if (!("body" in object) || object.body === null) {
    return new Response(null, { status: 304, headers });
  }

  // Parça istendiyse hangi aralığı verdiğimizi söylemek zorundayız.
  const range = object.range;
  if (range) {
    const start = "offset" in range ? (range.offset ?? 0) : object.size - (range.suffix ?? 0);
    const length = "length" in range && range.length != null
      ? range.length
      : object.size - start;
    headers.set("content-range", `bytes ${start}-${start + length - 1}/${object.size}`);
    return new Response(object.body, { status: 206, headers });
  }

  return new Response(object.body, { status: 200, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/media/")) {
      return serveMedia(request, env, url);
    }

    /* Fandom bağış formu. Gelen her aportación depoya "onay bekliyor"
       olarak düşüyor; hiçbiri doğrudan yayına çıkmıyor. */
    if (url.pathname === "/api/fandom") {
      return handleFandom(request, env);
    }

    /* Geri kalanı statik varlık katmanına: dosya varsa onu, yoksa
       index.html'i döner (wrangler.jsonc'deki single-page-application
       ayarı). React Router gerisini hallediyor. */
    return env.ASSETS.fetch(request);
  },
};
