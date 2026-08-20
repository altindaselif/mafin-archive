import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./i18n.js";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Home from "./pages/Home/Home.jsx";
import Quotes from "./pages/Quotes/Quotes.jsx";
import Episodes from "./pages/Episodes/Episodes.jsx";
import Videos from "./pages/Videos/Videos.jsx";
import Characters from "./pages/Characters/Characters.jsx";
import Press from "./pages/Press/Press.jsx";
import Actors from "./pages/Actors/Actors.jsx";
import Fandom from "./pages/Fandom/Fandom.jsx";
import Timeline from "./pages/Timeline/Timeline.jsx";
import Gallery from "./pages/Gallery/Gallery.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <ScrollToTop />
      <Header />
      <main>
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
        </Routes>
      </main>
      <Footer />
    </LanguageProvider>
  );
}
