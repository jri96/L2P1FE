import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import PokemonCard from "../components/PokemonCard";
import { CardSkeleton, EmptyState, ErrorNotice } from "../components/Feedback";
import { useApp } from "../context/AppContext";
import { usePokedex, usePokemonByType } from "../hooks/usePokeApi";
import { filterAndSort } from "../utils/pokemonQuery";

/** Favorieten: bewaarde Pokémon met zoeken, filteren en "team van maken". */
export default function Favorites() {
  const { favorites, favoriteSet, createTeamFromFavorites } = useApp();
  const navigate = useNavigate();
  const { pokemons, loading, error, retry } = usePokedex();

  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("id-asc");

  const { names: typeNames } = usePokemonByType(type);

  // Alleen de favorieten overhouden uit de volledige Pokédex-lijst
  const favoriteEntries = useMemo(
    () => pokemons.filter((pokemon) => favoriteSet.has(pokemon.id)),
    [pokemons, favoriteSet],
  );

  const results = useMemo(
    () => filterAndSort(favoriteEntries, { query, typeNames, sort }),
    [favoriteEntries, query, typeNames, sort],
  );

  const handleMakeTeam = () => {
    const team = createTeamFromFavorites();
    if (team) navigate(`/teams/${team.id}`);
  };

  if (error) {
    return <ErrorNotice message={error.message} onRetry={retry} />;
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Favorieten</h1>
          <p className="muted">
            {loading
              ? "Favorieten worden geladen…"
              : `${favorites.length} bewaarde Pokémon — sneller teams maken van je vaste selectie.`}
          </p>
        </div>

        <div className="page__header-actions">
          <Link to="/list" className="btn btn--ghost">
            ＋ Meer favorieten
          </Link>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleMakeTeam}
            disabled={favorites.length === 0}
          >
            🔥 Team maken van favorieten
          </button>
        </div>
      </header>

      {loading ? (
        <div className="pokemon-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          title="Nog geen favorieten"
          action={
            <Link to="/list" className="btn btn--primary">
              Naar de Pokédex
            </Link>
          }
        >
          Klik op het hartje van een kaart om een Pokémon te bewaren. Daarna kun je hier
          in één keer een team van maken.
        </EmptyState>
      ) : (
        <>
          <FilterBar query={query} onQuery={setQuery} type={type} onType={setType} sort={sort} onSort={setSort}>
            <span className="badge badge--static">{results.length} resultaten</span>
          </FilterBar>

          {results.length === 0 ? (
            <EmptyState title="Geen favorieten gevonden">
              Pas je zoekterm of typefilter aan.
            </EmptyState>
          ) : (
            <div className="pokemon-grid">
              {results.map((pokemon) => (
                <PokemonCard key={pokemon.id} id={pokemon.id} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
