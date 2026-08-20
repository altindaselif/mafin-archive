/*
 * Home ve Stats'ın paylaştığı hafif veri indeksi.
 *
 * scripts/build-home-index.mjs tarafından üretilen public/data/home.json'ı
 * okur. Bundle'a gömmek yerine fetch ediyoruz: 87 KB'lık veri JS'in içinde
 * olsaydı, parse edilene kadar sayfadaki hiçbir resim yüklenmeye başlamazdı.
 * Böylece hero ve bölüm kartları anında çiziliyor, veri paralel geliyor.
 *
 * İstek modül seviyesinde tek sefer yapılır ve sonucu saklanır — Home ile
 * Stats aynı anda isteyince iki fetch değil, tek fetch olur; sayfalar arası
 * gidip gelirken de tekrar indirilmez.
 */
import { useEffect, useState } from "react";

const DATA_URL = `${import.meta.env.BASE_URL}data/home.json`;

let cache = null;
let inFlight = null;

function load() {
  inFlight ??= fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cache = data;
      return data;
    })
    .catch((err) => {
      inFlight = null; // sonraki deneme yeniden istesin
      throw err;
    });
  return inFlight;
}

/* Veri gelene kadar null döner — çağıran taraf o sırada iskelet gösterir.
   Hata olursa da null kalır: ana sayfa çökmek yerine o bölümü atlar. */
export function useHomeIndex() {
  const [data, setData] = useState(cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    load()
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
