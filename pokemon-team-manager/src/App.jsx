import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import List from "./pages/List";
import Detail from "./pages/Detail";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

/**
 * Routing (react-router-dom):
 *   /                → Home
 *   /list            → Pokédex-lijst
 *   /detail/:id      → detail van één Pokémon
 *   /teams           → overzicht van teams
 *   /teams/:id       → detail van één team
 *   /favorieten      → favorieten
 * Alle routes hangen onder <Layout />, zodat Header, Footer en de
 * melding-oven op elk scherm zichtbaar zijn (<Outlet />).
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="list" element={<List />} />
        <Route path="detail/:id" element={<Detail />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:id" element={<TeamDetail />} />
        <Route path="favorieten" element={<Favorites />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
