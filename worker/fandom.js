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

/* Formdaki Turnstile widget'ına verdiğimiz eylem adı. Sunucu, gelen
   jetonun gerçekten BU formdan geldiğini buradan doğruluyor — başka bir
   sayfadan alınmış geçerli bir jeton burada kabul edilmiyor. */
const TURNSTILE_ACTION = "fandom-donation";

/*
 * Turnstile doğrulaması.
 *
 * Jeton tarayıcıdan geliyor ama ona güvenmiyoruz: Cloudflare'e sorup
 * gerçekten geçerli mi, hangi eylem için üretilmiş ve hangi sayfadan
 * gelmiş diye bakıyoruz. Üçü de tutmazsa istek reddediliyor.
 *
 * Ağ hatasında da reddediyoruz (fail closed): doğrulayamadığımız bir
 * isteği geçirmek, korumayı hiç koymamakla aynı şey olurdu.
 */
async function verifyTurnstile(token, clientIp, env) {
  const allowed = new Set(
    String(env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean),
  );

  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048 ||
    allowed.size === 0 ||
    !env.TURNSTILE_SECRET
  ) {
    return false;
  }

  let result;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: token,
          remoteip: clientIp ?? "",
        }),
      },
    );
    if (!res.ok) throw new Error(`siteverify ${res.status}`);
    result = await res.json();
  } catch {
    return false;
  }

  return (
    result.success === true &&
    result.action === TURNSTILE_ACTION &&
    allowed.has(result.hostname)
  );
}

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

/*
 * Dosya adı: gün-ay-yıl + 8 karakterlik rastgele kimlik.
 * Elle numara sayılmıyor — eskiden klasörü listeleyip en büyük numarayı
 * bulmak gerekiyordu, hem fazladan bir GitHub isteği hem de aynı anda iki
 * gönderim gelince çakışma riskiydi. Rastgele kimlikte ikisi de yok.
 */
function entryName(date) {
  const [y, m, d] = date.split("-");
  return `f${d}-${m}-${y}-${crypto.randomUUID().split("-")[0]}.json`;
}

async function writeEntry(token, name, record) {
  const body = JSON.stringify({
    message: `Fandom: nueva aportación pendiente — ${record.title}`,
    content: toBase64(JSON.stringify(record, null, 2) + "\n"),
    branch: REPO.branch,
  });
  return gh(`/contents/${REPO.dir}/${name}`, token, { method: "PUT", body });
}

/*
 * Arşivin tarihi Madrid saatine göre. Gönderim dünyanın neresinden
 * gelirse gelsin aynı saate göre damgalanıyor — yoksa aynı dakikada
 * gelen iki eser farklı günlere düşerdi.
 *
 * Sabit bir +1/+2 yerine `Intl`: İspanya yazın UTC+2, kışın UTC+1 ve
 * bu geçişi Intl kendisi biliyor. "en-CA" biçimi YYYY-MM-DD veriyor.
 */
function archiveDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

  /* Turnstile: asıl bot koruması. Honeypot basit botları eler, bu ise
     jetonu Cloudflare'e doğrulatır. Geçmezse hiçbir şey yazılmaz. */
  const ok = await verifyTurnstile(
    data["cf-turnstile-response"],
    request.headers.get("cf-connecting-ip"),
    env,
  );
  if (!ok) return json({ ok: false, error: "verification" }, 403);

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

  const date = archiveDate();
  const full = {
    ...record,
    date,
    approved: false, // arşivci onaylayana kadar sitede görünmez
  };

  const res = await writeEntry(token, entryName(date), full);
  if (!res.ok) return json({ ok: false, error: "server" }, 502);
  return json({ ok: true });
}
