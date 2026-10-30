import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Toast from "./Toast";

/** Scrollt terug naar boven bij elke nieuwe route (SPA voelt dan "fris" aan). */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Gedeelde "behuizing" van de app: Header + Footer + meldingen rondom de
 * inhoud van de actieve route (<Outlet /> komt van react-router).
 */
export default function Layout() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
