import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { LanguageProvider } from "./i18n.js";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Home from "./pages/Home/Home.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";

/*
 * Home dışındaki her sayfa kendi dosyasına ayrılır ve ancak kullanıcı o
 * sayfaya gittiğinde indirilir (code splitting). Böylece ana sayfaya giren
 * biri Galeri'nin, Prensa'nın, Fandom'un kodunu boşuna indirmez.
 *
 * Home lazy DEĞİL: açılış rotası olduğu için ayrı dosyaya almak fazladan
 * bir gidiş-geliş demek olurdu — ilk boyamayı geciktirirdi.
 *
 * Ağır veri dosyaları (episodes 408 KB, quotes 96 KB) artık yalnızca onları
 * kullanan sayfalardan import edildiği için otomatik olarak o sayfaların
 * dosyasına gidiyor; ana bundle'da yer kaplamıyorlar.
 */
const Timeline = lazy(() => import("./pages/Timeline/Timeline.jsx"));
const Episodes = lazy(() => import("./pages/Episodes/Episodes.jsx"));
const Videos = lazy(() => import("./pages/Videos/Videos.jsx"));
const Gallery = lazy(() => import("./pages/Gallery/Gallery.jsx"));
const Quotes = lazy(() => import("./pages/Quotes/Quotes.jsx"));
const Characters = lazy(() => import("./pages/Characters/Characters.jsx"));
const Press = lazy(() => import("./pages/Press/Press.jsx"));
const Actors = lazy(() => import("./pages/Actors/Actors.jsx"));
const Fandom = lazy(() => import("./pages/Fandom/Fandom.jsx"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // `behavior: instant` şart: global.css'teki scroll-behavior: smooth
    // yüzünden sayfa geçişlerinde yukarı doğru kayma animasyonu oluyordu.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

/* Sayfa dosyası inerken görünen boşluk. Sayfa başlığının oturduğu yükseklik
   kadar yer tutar ki chunk gelince içerik zıplamasın. */
function PageFallback() {
  return <div style={{ minHeight: "60vh" }} aria-busy="true" />;
}

export default function App() {
  /* Rota anahtarı ErrorBoundary'ye veriliyor: kullanıcı kırık bir sayfadan
     menüyle başka bir yere geçince hata temizlenip normal render dönüyor. */
  const { pathname } = useLocation();

  return (
    <LanguageProvider>
      <ScrollToTop />
      <Header />
      <main>
        <ErrorBoundary routeKey={pathname}>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/guide" element={<Episodes />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/press" element={<Press />} />
              <Route path="/actors" element={<Actors />} />
              <Route path="/fandom" element={<Fandom />} />
              {/* Bilinmeyen adres: header + footer arasında boş alan yerine künye */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </LanguageProvider>
  );
}
