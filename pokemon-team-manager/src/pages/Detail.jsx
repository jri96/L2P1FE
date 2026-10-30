import { Link, useParams } from "react-router-dom";
import AddToTeamDialog from "../components/AddToTeamDialog";
import { ErrorNotice, Spinner } from "../components/Feedback";
import StatBar from "../components/StatBar";
import TypeChip from "../components/TypeChip";
import { useApp } from "../context/AppContext";
import { usePokemon, useSpecies } from "../hooks/usePokeApi";
import { formatName } from "../api/pokeapi";

/** Detailpagina van één Pokémon: alle data uit de PokéAPI. */
export default function Detail() {
  const { id } = useParams();
  const { pokemon, loading, error } = usePokemon(id);
  const { species } = useSpecies(id);
  const { isFavorite, toggleFavorite } = useApp();

  const backLink = (
    <Link to="/list" className="crumb">
      ← Terug naar de Pokédex
    </Link>
  );

  if (loading) {
    return (
      <div className="page">
        {backLink}
        <Spinner label="Pokémon ophalen…" />
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="page">
        {backLink}
        <ErrorNotice
          message={error?.message ?? "Deze Pokémon bestaat niet (of niet meer)."}
        />
      </div>
    );
  }

  const name = formatName(pokemon.name);
  const favorite = isFavorite(pokemon.id);

  return (
    <div className="page">
      {backLink}

      <div className="detail">
        <section className="detail__art panel">
          <div className="detail__sprite">
            <img src={pokemon.sprite} alt={name} />
          </div>

          <div className="detail__actions">
            <button
              type="button"
              className={favorite ? "btn btn--dark is-on" : "btn btn--dark"}
              onClick={() => toggleFavorite(pokemon.id)}
              aria-pressed={favorite}
            >
              {favorite ? "♥ Uit favorieten verwijderen" : "♡ Bewaar als favoriet"}
            </button>
            <AddToTeamDialog pokemon={pokemon} label="＋ Toevoegen aan team" />
          </div>
        </section>

        <section className="panel">
          <header className="detail__header">
            <span className="detail__number">№ {String(pokemon.id).padStart(3, "0")}</span>
            <h1>{name}</h1>
            <div className="pokemon-card__types">
              {pokemon.types.map((type) => (
                <TypeChip key={type} type={type} />
              ))}
            </div>
          </header>

          <h2 className="section__title">Over</h2>
          <p className="detail__about">
            {species?.description ??
              (species ? "Geen beschrijving beschikbaar." : "Beschrijving wordt geladen…")}
          </p>

          <dl className="detail__facts">
            <div>
              <dt>Categorie</dt>
              <dd>{species?.genus ?? "—"}</dd>
            </div>
            <div>
              <dt>Generatie</dt>
              <dd>{species?.generation ?? "—"}</dd>
            </div>
            <div>
              <dt>Hoogte</dt>
              <dd>{pokemon.height.toFixed(1)} m</dd>
            </div>
            <div>
              <dt>Gewicht</dt>
              <dd>{pokemon.weight.toFixed(1)} kg</dd>
            </div>
          </dl>

          <h2 className="section__title">Basis-statistieken</h2>
          <div className="stat-list">
            {pokemon.stats.map((stat) => (
              <StatBar key={stat.name} name={stat.name} value={stat.value} />
            ))}
          </div>

          <h2 className="section__title">Vermogens</h2>
          <ul className="chip-list">
            {pokemon.abilities.map((ability) => (
              <li key={ability.name}>
                <span className="chip chip--muted">
                  {formatName(ability.name)}
                  {ability.hidden && <em> · verborgen</em>}
                </span>
              </li>
            ))}
          </ul>

          <h2 className="section__title">Bekende moves</h2>
          <ul className="chip-list">
            {pokemon.moves.map((move) => (
              <li key={move}>
                <span className="chip chip--muted">{formatName(move)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
