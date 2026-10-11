import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./Videos.module.css";
import SearchInput from "../../components/SearchInput/SearchInput.jsx";
import MoodFilter from "../../components/MoodFilter/MoodFilter.jsx";
import SeasonFilter from "../../components/SeasonFilter/SeasonFilter.jsx";
import VideoCard from "../../components/VideoCard/VideoCard.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import ListToolbar from "../../components/ListToolbar/ListToolbar.jsx";
import LoadMore from "../../components/LoadMore/LoadMore.jsx";
import { COMMON, useLang } from "../../i18n.js";
import { VIDEO_BASE_URL, SCENE_PATH } from "../../config.js";
import episodeMeta from "../../data/generated/episodeMeta.json";
import catalogue from "../../data/videos.json";
import milestones from "../../data/timeline.js";
import { seasonOf, seasonsIn } from "../../data/seasonInfo.js";
import {
  EXCLUSIONS,
  filterCollection,
  orderMoods,
  toggleMood as toggleMoodIn,
} from "../../lib/collection.js";

const L = {
  title: { es: "Vídeos", en: "Videos" },
  subtitle: {
    es: "Cada momento de la historia Mafin, en vídeo. Busca, o filtra por temática para encontrar los momentos que te apetece revivir.",
    en: "Every milestone of the Mafin story, in video. Search, or filter by mood to find the moments you feel like reliving.",
  },
  copyright: {
    es: "Por motivos de derechos de autor, solo compartimos escenas breves, no capítulos completos.",
    en: "For copyright reasons, we share only short scenes, not full episodes.",
  },
  credit: {
    es: "Cortes y subtítulos por",
    en: "Cuts and subtitles by",
  },
  seeInStory: {
    es: "Descubre estos momentos en la cronología →",
    en: "Discover these moments in the timeline →",
  },
  searchPlaceholder: { es: "Buscar vídeos…", en: "Search videos…" },
  video: { es: "vídeo", en: "video" },
  videos: { es: "vídeos", en: "videos" },
  empty: {
    es: "Ningún vídeo coincide en esta temporada. Prueba otra búsqueda, otras temáticas u otro volumen.",
    en: "No video matches in this season. Try another search, other moods, or another volume.",
  },
  playing: { es: "Reproduciendo", en: "Now playing" },
  player: { es: "Reproductor", en: "Player" },
  untitled: { es: "Sin título", en: "Untitled" },
};

/* Bu klipler zaman çizelgesindeki anların sahneleri; başlıklar oradan
 * gelir ("El primer beso"), ham bölüm adlarından değil. */
/* `kind: "gap"` kayıtları an değil, zaman çizelgesindeki kasıtlı boşluk.
   Başlık kaynağı olarak kullanılmamalılar — bu sayfa yalnızca gerçek
   anların başlıklarını devralıyor. */
const MILESTONE_BY_EPISODE = new Map(
  milestones.filter((m) => m.kind !== "gap").map((m) => [m.episode, m]),
);

/*
 * Katalog doğrudan import ediliyor. Eskiden çalışma anında fetch ediliyordu
 * ve yorumda "~1000 kayıt bundle'ı şişirir" yazıyordu — gerçek sayı 54,
 * dosya 4 KB. Karşılığında ekstra bir gidiş-geliş, yükleniyor durumu, hata
 * durumu, iskelet ve AbortController taşınıyordu. Bu sayfa zaten lazy bir
 * chunk; 4 KB oraya girince hiçbir şeyi etkilemiyor.
 * (Katalog gerçekten binlere çıkarsa fetch'e dönmek doğru olur.)
 *
 * Kayıtlar burada, modül seviyesinde bir kez normalize ediliyor: sayfanın
 * geri kalanı veriye koşulsuz güveniyor, filtrelerde dağınık `?? []`
 * kontrolleri olmuyor.
 *
 * Başlık ve temalar bölüm numarasından devralınıyor — video kaydında
 * tekrarlanan veri yok. episodes.js'in tamamı (409 KB) yerine build'de
 * üretilen meta indeksi (62 KB) kullanılıyor: bu sayfa bölüm açıklamalarını
 * hiç göstermiyor, açıklamalar da verinin dörtte üçü. Sezon da numaradan
 * seasonOf() ile türüyor, indekste saklanmıyor.
 */
const VIDEOS = catalogue.map((v) => {
  const ep = episodeMeta[v.episode];
  const ms = MILESTONE_BY_EPISODE.get(v.episode);
  const file = typeof v.file === "string" && v.file ? v.file : null;
  return {
    id: v.id ?? `v${v.episode}`,
    episode: v.episode,
    file,
    title: ms?.title ?? ep?.t ?? L.untitled,
    moods: Array.isArray(ep?.m) ? ep.m : [],
    season: seasonOf(v.episode),
    poster: file
      ? `${import.meta.env.BASE_URL}img/videos-posters/${file.replace(/\.mp4$/, ".jpg")}`
      : null,
  };
});

/* Başlangıçta / her "daha fazla" tıklamasında kaç kart çizilecek. */
const PAGE_SIZE = 20;

/* İlk ekrana sığan kart sayısı — bunların posterleri ertelenmeden,
   öncelikli indiriliyor. Gerisi görünür alana yaklaştıkça geliyor. */
const EAGER_CARDS = 6;

export default function Videos() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query); // typing stays responsive on large lists
  const [activeMoods, setActiveMoods] = useState(new Set());
  const [activeSeason, setActiveSeason] = useState(1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [playing, setPlaying] = useState(null); // the video object shown in the modal
  const [searchParams, setSearchParams] = useSearchParams();

  /*
   * Deep link from the timeline: /videos?ep=186 opens that scene straight
   * in the player. We also switch to its season so the list behind the
   * modal is the right one, then clear the param so closing won't reopen it.
   */
  useEffect(() => {
    const ep = searchParams.get("ep");
    if (!ep) return;
    const match = VIDEOS.find((v) => String(v.episode) === ep);
    if (match) {
      setPlaying(match);
      setActiveSeason(match.season);
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const allMoods = useMemo(() => orderMoods(VIDEOS.flatMap((v) => v.moods)), []);
  const seasons = useMemo(() => seasonsIn(VIDEOS), []);

  /*
   * Kararlı referans — VideoCard React.memo ile sarılı, prop değişmezse
   * yeniden render olmuyor. Fonksiyonel updater sayesinde boş bağımlılık
   * dizisi güvenli: her çağrıda GÜNCEL set okunuyor.
   */
  const toggleMood = useCallback(
    (mood) => setActiveMoods((prev) => toggleMoodIn(prev, mood)),
    [],
  );

  /* Vídeos yalnızca başlıkta arıyor — Guía'dan tek farkı bu. */
  const filtered = useMemo(
    () =>
      filterCollection(VIDEOS, {
        query: deferredQuery,
        moods: activeMoods,
        season: activeSeason,
        searchText: (v) => `${v.episode} ${t(v.title)}`,
      }),
    [deferredQuery, activeMoods, activeSeason, t],
  );

  // New search / filter → back to the first page of results.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [deferredQuery, activeMoods, activeSeason]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  // Stable reference so React.memo on VideoCard actually prevents re-renders.
  const handlePlay = useCallback((video) => setPlaying(video), []);

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep99.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>
      {/* Telif notu BURADA DEĞİL, sayfanın dibinde: göz atmaya başlamadan
          önce okunması gereken bir şey değil, "bu videolar neden kısa"
          sorusu ancak listeyi gördükten sonra doğuyor. Orada zaten aynı
          sesle konuşan bir künye satırı vardı, ikisi birlikte kolofon
          oluyor. */}
      <p className={styles.storyLink}>
        <Link to="/timeline">{t(L.seeInStory)}</Link>
      </p>

      <div className={styles.controls}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t(L.searchPlaceholder)}
        />
        <MoodFilter
          moods={allMoods}
          active={activeMoods}
          onToggle={toggleMood}
          exclusions={EXCLUSIONS}
        />
      </div>

      <ListToolbar
        className={styles.toolbar}
        count={`${filtered.length} ${
          filtered.length === 1 ? t(L.video) : t(L.videos)
        }`}
      >
        <SeasonFilter
          seasons={seasons}
          activeSeason={activeSeason}
          onSeasonChange={setActiveSeason}
        />
      </ListToolbar>

      <div className={styles.grid}>
        {visible.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            tone={i % 6}
            onPlay={handlePlay}
            priority={i < EAGER_CARDS}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className={styles.status}>{t(L.empty)}</p>
      )}

      <LoadMore
        remaining={filtered.length - visibleCount}
        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
      />

      {/* Sayfanın kolofonu: solda videoların neden kısa olduğu, sağda
          onları kesen kişi. İkisi de aynı türden bilgi — "bu videolar
          nasıl oldu" — ve ikisi de listeden SONRA okunur. */}
      <div className={styles.colophon}>
        <p className={styles.copyright}>{t(L.copyright)}</p>
        <p className={styles.credit}>
          {t(L.credit)}{" "}
          <a href="https://x.com/starryskyEN" target="_blank" rel="noopener noreferrer">
            @starryskyEN
          </a>
        </p>
      </div>

      <Modal
        open={playing !== null}
        onClose={() => setPlaying(null)}
        wide
        label={playing ? `${t(L.playing)}: ${t(playing.title)}` : t(L.player)}
      >
        {playing && (
          <div className={styles.player}>
            <div className={styles.playerFrame}>
              {/* Doğrudan R2'den; videos.json sadece dosya adını tutar,
                  host ve klasör config.js'ten gelir */}
              <video
                src={`${VIDEO_BASE_URL}/${SCENE_PATH}/${playing.file}`}
                poster={playing.poster ?? undefined}
                controls
                autoPlay
                playsInline
              />
            </div>
            <div className={styles.playerInfo}>
              <span className={styles.playerEpisode}>
                {t(COMMON.episode)} {playing.episode}
              </span>
              <span className={styles.playerMeta}>{t(playing.title)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
