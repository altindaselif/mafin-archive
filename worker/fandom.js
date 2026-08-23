/*
 * Fandom bağış formunun arka ucu.
 *
 * Ziyaretçi form gönderir → burada doğrulanır → depoya `approved: false`
 * olarak bir JSON dosyası yazılır. O dosya CMS'te "onay bekliyor" olarak
 * görünür; arşivci okuyup "Yayında" kutusunu işaretleyene kadar sitede
 * görünmez. Yani buradan gelen hiçbir şey doğrudan yayına çıkmıyor.
 *
 * Depoya yazma yetkisi env.GITHUB_TOKEN'da: yalnızca bu depoya içerik
 * yazabilen dar kapsamlı bir token.
 */

const REPO = {
  owner: "altindaselif",
  repo: "mafin-archive",
  branch: "main",
  dir: "src/data/fandom",
};

const TYPES = new Set(["Canción", "Fanfic", "Arte"]);

/* Alan sınırları: hem veriyi hem CMS arayüzünü makul tutuyor. */
const LIMITS = { title: 120, author: 80, url: 500, note: 140 };

/* Kontrol karakterlerini (satır sonu dahil) BOŞLUĞA çevir — silmek
   kelimeleri birbirine yapıştırıyordu. Sonra fazla boşlukları tekle,
   kırp, sınıra kes. */
function clean(value, max) {
  return String(value ?? "")
    .replace(/\p{Cc}/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/* UTF-8 metni base64'e — GitHub API dosya içeriğini böyle istiyor.
   btoa() tek başına Türkçe/İspanyolca karakterlerde bozuluyor. */
function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function gh(path, token, init = {}) {
  return fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.repo}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "user-agent": "universomafin-archive",
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

/* Sıradaki numara: klasördeki en büyük f<N>.json'un bir fazlası. */
async function nextNumber(token) {
  const res = await gh(`/contents/${REPO.dir}?ref=${REPO.branch}`, token);
  if (!res.ok) return null;
  const files = await res.json();
  const numbers = files
    .map((f) => /^f(\d+)\.json$/.exec(f.name)?.[1])
    .filter(Boolean)
    .map(Number);
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

async function writeEntry(token, number, record) {
  const name = `f${String(number).padStart(2, "0")}.json`;
  const body = JSON.stringify({
    message: `Fandom: nueva aportación pendiente — ${record.title}`,
    content: toBase64(JSON.stringify(record, null, 2) + "\n"),
    branch: REPO.branch,
  });
  return gh(`/contents/${REPO.dir}/${name}`, token, { method: "PUT", body });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function handleFandom(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method" }, 405);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "body" }, 400);
  }

  /* Honeypot: insanlar bu alanı görmüyor. Doluysa bot demektir —
     başarılı gibi cevap verip sessizce atıyoruz ki bot fark etmesin. */
  if (clean(data.website, 50)) return json({ ok: true });

  const record = {
    type: TYPES.has(data.type) ? data.type : "Arte",
    title: clean(data.title, LIMITS.title),
    author: clean(data.author, LIMITS.author),
    url: clean(data.url, LIMITS.url),
    note: clean(data.note, LIMITS.note),
  };

  if (!record.title || !record.author) {
    return json({ ok: false, error: "required" }, 400);
  }

  let parsed;
  try {
    parsed = new URL(record.url);
  } catch {
    return json({ ok: false, error: "url" }, 400);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return json({ ok: false, error: "url" }, 400);
  }

  const token = env.GITHUB_TOKEN;
  if (!token) return json({ ok: false, error: "server" }, 500);

  const base = await nextNumber(token);
  if (base == null) return json({ ok: false, error: "server" }, 502);

  /* Numara çakışırsa (aynı anda iki gönderim) bir sonrakini dene. */
  for (let attempt = 0; attempt < 3; attempt++) {
    const number = base + attempt;
    const full = {
      number,
      id: `f${number}`,
      ...record,
      date: new Date().toISOString().slice(0, 10),
      approved: false, // arşivci onaylayana kadar sitede görünmez
    };
    const res = await writeEntry(token, number, full);
    if (res.ok) return json({ ok: true });
    if (res.status !== 422) return json({ ok: false, error: "server" }, 502);
  }

  return json({ ok: false, error: "conflict" }, 409);
}
