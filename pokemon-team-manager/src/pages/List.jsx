import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import PokemonCard from "../components/PokemonCard";
import { CardSkeleton, EmptyState, ErrorNotice } from "../components/Feedback";
import { useApp } from "../context/AppContext";
import { usePokedex, usePokemonByType } from "../hooks/usePokeApi";
import { filterAndSort, pageNumbers, paginate } from "../utils/pokemonQuery";

const PER_PAGE = 24;

/** De Pokédex: zoeken, filteren, sorteren en pagina's door bladeren. */
export default function List() {
  const { favoriteSet } = useApp();
  const { pokemons, loading, error, retry } = usePokedex();

  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("id-asc");
  const [page, setPage] = useState(1);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const { names: typeNames, loading: typeLoading } = usePokemonByType(type);

  // Bij elke wijziging van de filters terug naar pagina 1
  const updateQuery = (value) => {
    setQuery(value);
    setPage(1);
  };
  const updateType = (value) => {
    setType(value);
    setPage(1);
  };
  const updateSort = (value) => {
    setSort(value);
    setPage(1);
  };
  const toggleOnlyFavorites = () => {
    setOnlyFavorites((value) => !value);
    setPage(1);
  };

  const results = useMemo(() => {
    const base = onlyFavorites
      ? pokemons.filter((pokemon) => favoriteSet.has(pokemon.id))
      : pokemons;
    return filterAndSort(base, { query, typeNames, sort });
  }, [pokemons, favoriteSet, query, typeNames, sort, onlyFavorites]);

  const { items, page: currentPage, totalPages } = paginate(results, page, PER_PAGE);

  if (error) {
    return <ErrorNotice message={error.message} onRetry={retry} />;
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Pokédex</h1>
          <p className="muted">Alle {pokemons.length} Pokémon — zoek, filter en voeg toe aan je team.</p>
        </div>
      </header>

      <FilterBar
        query={query}
        onQuery={updateQuery}
        type={type}
        onType={updateType}
        sort={sort}
        onSort={updateSort}
      >
        <button
          type="button"
          className={onlyFavorites ? "btn btn--primary" : "btn btn--ghost"}
          onClick={toggleOnlyFavorites}
          aria-pressed={onlyFavorites}
        >
          ♥ Alleen favorieten
        </button>
      </FilterBar>

      <p className="result-count" aria-live="polite">
        {loading || typeLoading
          ? "Even geduld, data wordt opgehaald…"
          : `${results.length} Pokémon gevonden${
              totalPages > 1 ? ` · pagina ${currentPage} van ${totalPages}` : ""
            }`}
      </p>

      {loading ? (
        <div className="pokemon-grid">
          {Array.from({ length: 12 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState title="Geen Pokémon gevonden">
          {onlyFavorites ? (
            <>
              Je hebt nog geen favorieten die aan deze filter voldoen. Klik op een hartje om
              Pokémon te bewaren.
            </>
          ) : (
            <>Probeer een andere zoekterm, type of sortering.</>
          )}
        </EmptyState>
      ) : (
        <>
          <div className="pokemon-grid">
            {items.map((pokemon) => (
              <PokemonCard key={pokemon.id} id={pokemon.id} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Pagina's">
              <button
                type="button"
                className="pagination__btn"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {pageNumbers(currentPage, totalPages).map((entry, index) =>
                entry === "…" ? (
                  <span className="pagination__gap" key={`gap-${index}`}>
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={entry}
                    className={entry === currentPage ? "pagination__btn is-active" : "pagination__btn"}
                    onClick={() => setPage(entry)}
                    aria-current={entry === currentPage ? "page" : undefined}
                  >
                    {entry}
                  </button>
                ),
              )}
              <button
                type="button"
                className="pagination__btn"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
