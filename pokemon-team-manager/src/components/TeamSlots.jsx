import { MAX_TEAM_SIZE } from "../context/AppContext";
import { spriteUrl } from "../api/pokeapi";

/**
 * De zes vakjes van een team. Gevulde vakjes tonen een sprite (met optionele
 * verwijder-knop), lege vakjes zijn knoppen om iets toe te voegen.
 */
export default function TeamSlots({ pokemonIds, onRemove, onAdd }) {
  const slots = Array.from({ length: MAX_TEAM_SIZE }, (_, index) => pokemonIds[index] ?? null);

  return (
    <div className="team-slots">
      {slots.map((id, index) =>
        id ? (
          <div className="team-slot" key={id}>
            <img src={spriteUrl(id)} alt={`Pokémon ${id}`} loading="lazy" />
            {onRemove && (
              <button
                type="button"
                className="team-slot__remove"
                onClick={() => onRemove(id)}
                aria-label={`Verwijder Pokémon ${id} uit het team`}
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="team-slot team-slot--empty"
            key={`leeg-${index}`}
            onClick={onAdd}
            disabled={!onAdd}
            aria-label="Leeg vakje — voeg een Pokémon toe"
          >
            ＋
          </button>
        ),
      )}
    </div>
  );
}
