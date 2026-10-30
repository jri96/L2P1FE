import { TYPES } from "../api/pokeapi";

/**
 * Zoek- en filterbalk. Staat op de Pokédex én op Favorieten.
 * De waarden komen uit de state van de pagina; dit component roept alleen
 * de callbacks aan (controlled inputs).
 */
export default function FilterBar({
  query,
  onQuery,
  type,
  onType,
  sort,
  onSort,
  placeholder = "Zoek op naam of nummer…",
  children,
}) {
  return (
    <div className="filter-bar">
      <div className="search-field">
        <span aria-hidden="true">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="Zoeken"
        />
        {query && (
          <button
            type="button"
            className="search-field__clear"
            onClick={() => onQuery("")}
            aria-label="Zoekopdracht wissen"
          >
            ✕
          </button>
        )}
      </div>

      <label className="select-field">
        <span className="sr-only">Filter op type</span>
        <select value={type} onChange={(event) => onType(event.target.value)}>
          <option value="all">Alle types</option>
          {TYPES.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="select-field">
        <span className="sr-only">Sorteren</span>
        <select value={sort} onChange={(event) => onSort(event.target.value)}>
          <option value="id-asc">Sorteer: № oplopend</option>
          <option value="id-desc">Sorteer: № aflopend</option>
          <option value="name-asc">Sorteer: A–Z</option>
          <option value="name-desc">Sorteer: Z–A</option>
        </select>
      </label>

      {children}
    </div>
  );
}
