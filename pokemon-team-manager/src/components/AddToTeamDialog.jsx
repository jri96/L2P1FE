import { useState } from "react";
import Modal from "./Modal";
import { MAX_TEAM_SIZE, useApp } from "../context/AppContext";
import { formatName } from "../api/pokeapi";

/**
 * "＋"-knop die opent naar een dialog: kies een team (of maak er meteen één).
 * Zowel op de Pokémon-kaart als op de detailpagina gebruikt.
 */
export default function AddToTeamDialog({ pokemon, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const { teams, addPokemonToTeam, createTeam } = useApp();

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  const handleAdd = (teamId) => {
    if (addPokemonToTeam(teamId, pokemon.id)) closeDialog();
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const team = createTeam(teamName, [pokemon.id]);
    if (team) {
      setTeamName("");
      closeDialog();
    }
  };

  return (
    <>
      <button
        type="button"
        className={label ? "btn btn--primary" : "icon-btn"}
        onClick={openDialog}
        title="Toevoegen aan een team"
        aria-label={`Voeg ${formatName(pokemon.name)} toe aan een team`}
      >
        {label ?? "＋"}
      </button>

      {isOpen && (
        <Modal
          title={`Voeg ${formatName(pokemon.name)} toe aan een team`}
          onClose={closeDialog}
        >
          {teams.length === 0 ? (
            <p className="muted">Je hebt nog geen teams — maak er hieronder één.</p>
          ) : (
            <ul className="team-picker">
              {teams.map((team) => {
                const full = team.pokemonIds.length >= MAX_TEAM_SIZE;
                return (
                  <li key={team.id}>
                    <button
                      type="button"
                      className="team-picker__item"
                      onClick={() => handleAdd(team.id)}
                    >
                      <span>{team.name}</span>
                      <span className={full ? "badge badge--full" : "badge"}>
                        {team.pokemonIds.length}/{MAX_TEAM_SIZE}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <form className="inline-form" onSubmit={handleCreate}>
            <input
              type="text"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Nieuw team · naam invullen…"
              aria-label="Naam van het nieuwe team"
            />
            <button type="submit" className="btn btn--primary">
              Maak &amp; voeg toe
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
