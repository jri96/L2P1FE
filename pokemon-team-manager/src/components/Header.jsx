import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import { useApp } from "../context/AppContext";

/** Bovenbalk: logo, menu en een teller met teams + favorieten. */
export default function Header() {
  const { teams, favorites } = useApp();

  return (
    <header className="app-header">
      <Link to="/" className="brand">
        <span className="brand__logo" aria-hidden="true">⚡</span>
        <span className="brand__name">PokéTeam Manager</span>
      </Link>

      <Navigation />

      <p className="app-header__meta">
        {teams.length} {teams.length === 1 ? "team" : "teams"} · {favorites.length}{" "}
        {favorites.length === 1 ? "favoriet" : "favorieten"}
      </p>
    </header>
  );
}
