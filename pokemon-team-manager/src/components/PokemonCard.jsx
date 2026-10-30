import { Link } from "react-router-dom";
import { formatName } from "../api/pokeapi";
import { usePokemon } from "../hooks/usePokeApi";
import { useApp } from "../context/AppContext";
import AddToTeamDialog from "./AddToTeamDialog";
import { CardSkeleton } from "./Feedback";
import TypeChip from "./TypeChip";

/**
 * Kaart voor één Pokémon. Hergebruikt op de Pokédex, Favorieten en Team-pagina.
 *
 * Je kunt óf een volledig `pokemon`-object meegeven, óf alleen een `id`:
 * in dat laatste geval haalt de kaart de data zelf op uit de PokéAPI.
 * Met `action` vervang je de standaard knoppen (bijv. door "Verwijderen").
 */
export default function PokemonCard({ id, pokemon: givenPokemon, action }) {
  const { isFavorite, toggleFavorite } = useApp();
  const { pokemon: fetched, loading, error } = usePokemon(givenPokemon ? null : id);
  const pokemon = givenPokemon ?? fetched;

  if (loading) return <CardSkeleton />;
  if (error || !pokemon) {
    return (
      <div className="pokemon-card is-error">
        <p>{error?.message ?? "Deze Pokémon kon niet geladen worden."}</p>
      </div>
    );
  }

  const favorite = isFavorite(pokemon.id);
  const name = formatName(pokemon.name);

  return (
    <article className="pokemon-card">
      <Link to={`/detail/${pokemon.id}`} className="pokemon-card__art" tabIndex={-1} aria-hidden="true">
        <img src={pokemon.sprite} alt="" loading="lazy" />
      </Link>

      <div className="pokemon-card__body">
        <span className="pokemon-card__number">№ {String(pokemon.id).padStart(3, "0")}</span>
        <Link to={`/detail/${pokemon.id}`} className="pokemon-card__name">
          {name}
        </Link>
        <div className="pokemon-card__types">
          {pokemon.types.map((type) => (
            <TypeChip key={type} type={type} />
          ))}
        </div>
      </div>

      <div className="pokemon-card__actions">
        {action ?? (
          <>
            <button
              type="button"
              className={favorite ? "icon-btn is-on" : "icon-btn"}
              onClick={() => toggleFavorite(pokemon.id)}
              aria-pressed={favorite}
              title={favorite ? "Uit favorieten verwijderen" : "Bewaar als favoriet"}
              aria-label={favorite ? `${name} uit favorieten` : `${name} bewaren als favoriet`}
            >
              ♥
            </button>
            <AddToTeamDialog pokemon={pokemon} />
          </>
        )}
      </div>
    </article>
  );
}
