import { NavLink } from "react-router-dom";

/** Menulinks — hierin staan alle schermen die de app heeft. */
const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/list", label: "Pokédex" },
  { to: "/teams", label: "Teams" },
  { to: "/favorieten", label: "Favorieten" },
];

/**
 * <Navigation /> wordt in de Header gebruikt en is op élk scherm zichtbaar.
 * NavLink markeert automatisch de actieve link (className-functie).
 */
export default function Navigation() {
  return (
    <nav className="navigation" aria-label="Hoofdmenu">
      {LINKS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
