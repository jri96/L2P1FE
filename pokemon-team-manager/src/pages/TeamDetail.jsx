import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState, ErrorNotice } from "../components/Feedback";
import PokemonCard from "../components/PokemonCard";
import TeamSlots from "../components/TeamSlots";
import { MAX_TEAM_SIZE, useApp } from "../context/AppContext";
import { usePokedex } from "../hooks/usePokeApi";
import { formatName, spriteUrl } from "../api/pokeapi";

/** Eén team beheren: leden bekijken, toevoegen, verwijderen, hernoemen. */
export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    teams,
    renameTeam,
    deleteTeam,
    addPokemonToTeam,
    removePokemonFromTeam,
  } = useApp();

  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");

  const { pokemons, loading, error, retry } = usePokedex();

  const team = teams.find((item) => item.id === id);

  const pickerResults = useMemo(() => {
    const search = pickerQuery.trim().toLowerCase();
    if (!search) return [];
    const taken = new Set(team?.pokemonIds ?? []);
    return pokemons
      .filter(
        (pokemon) =>
          !taken.has(pokemon.id) &&
          (String(pokemon.id).startsWith(search) || pokemon.name.includes(search)),
      )
      .slice(0, 24);
  }, [pokemons, pickerQuery, team]);

  if (!team) {
    return (
      <div className="page">
        <EmptyState
          title="Team niet gevonden"
          action={
            <Link to="/teams" className="btn btn--primary">
              Terug naar mijn teams
            </Link>
          }
        >
          Dit team bestaat niet (meer). Misschien is hij zojuist verwijderd.
        </EmptyState>
      </div>
    );
  }

  const startRename = () => {
    setNameDraft(team.name);
    setRenaming(true);
  };

  const handleRename = (event) => {
    event.preventDefault();
    if (renameTeam(team.id, nameDraft)) setRenaming(false);
  };

  const handleDelete = () => {
    deleteTeam(team.id);
    navigate("/teams");
  };

  const handleAdd = (pokemonId) => {
    if (team.pokemonIds.length < MAX_TEAM_SIZE) addPokemonToTeam(team.id, pokemonId);
  };

  return (
    <div className="page">
      <Link to="/teams" className="crumb">
        ← Alle teams
      </Link>

      <header className="page__header">
        <div>
          {renaming ? (
            <form className="inline-form" onSubmit={handleRename}>
              <input
                type="text"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                autoFocus
                aria-label="Nieuwe teamnaam"
              />
              <button type="submit" className="btn btn--primary btn--small">
                Opslaan
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => setRenaming(false)}
              >
                Annuleer
              </button>
            </form>
          ) : (
            <h1>{team.name}</h1>
          )}
          <p className="muted">
            {team.pokemonIds.length}/{MAX_TEAM_SIZE} leden · aangemaakt {team.createdAt}
          </p>
        </div>

        <div className="page__header-actions">
          {!renaming && (
            <button type="button" className="btn btn--ghost" onClick={startRename}>
              Hernoemen
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setPickerOpen((open) => !open)}
            disabled={team.pokemonIds.length >= MAX_TEAM_SIZE}
          >
            {pickerOpen ? "Picker sluiten" : "＋ Pokémon toevoegen"}
          </button>
          {confirmDelete ? (
            <span className="confirm-row">
              <button type="button" className="btn btn--danger" onClick={handleDelete}>
                Ja, verwijder team
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setConfirmDelete(false)}
              >
                Annuleer
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setConfirmDelete(true)}
            >
              Verwijder team
            </button>
          )}
        </div>
      </header>

      <section className="panel">
        <div className="panel__header">
          <h2 className="section__title">Teamleden</h2>
          <span className="badge">{team.pokemonIds.length}/{MAX_TEAM_SIZE}</span>
        </div>

        <TeamSlots
          pokemonIds={team.pokemonIds}
          onRemove={(pokemonId) => removePokemonFromTeam(team.id, pokemonId)}
          onAdd={() => setPickerOpen(true)}
        />
      </section>

      {pickerOpen && (
        <section className="panel picker">
          <div className="panel__header">
            <h2 className="section__title">Zoek een Pokémon om toe te voegen</h2>
            <button type="button" className="icon-btn" onClick={() => setPickerOpen(false)} aria-label="Picker sluiten">
              ✕
            </button>
          </div>

          <div className="search-field">
            <span aria-hidden="true">🔍</span>
            <input
              type="search"
              value={pickerQuery}
              onChange={(event) => setPickerQuery(event.target.value)}
              placeholder="Typ een naam of nummer…"
              aria-label="Zoek een Pokémon"
              autoFocus
            />
          </div>

          {loading && <p className="muted">Pokédex wordt geladen…</p>}
          {error && <ErrorNotice message={error.message} onRetry={retry} />}

          {pickerQuery.trim() === "" ? (
            <p className="muted">Typ hierboven om door de {pokemons.length} Pokémon te zoeken.</p>
          ) : pickerResults.length === 0 ? (
            <p className="muted">Geen resultaat (of alle resultaten zitten al in je team).</p>
          ) : (
            <ul className="picker-list">
              {pickerResults.map((pokemon) => {
                const full = team.pokemonIds.length >= MAX_TEAM_SIZE;
                return (
                  <li key={pokemon.id} className="picker-list__item">
                    <img src={spriteUrl(pokemon.id)} alt="" loading="lazy" />
                    <span className="picker-list__number">№ {pokemon.id}</span>
                    <span className="picker-list__name">{formatName(pokemon.name)}</span>
                    <button
                      type="button"
                      className="btn btn--primary btn--small"
                      onClick={() => handleAdd(pokemon.id)}
                      disabled={full}
                    >
                      {full ? "Team vol" : "＋ Toevoegen"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <section className="section">
        <div className="panel__header">
          <h2 className="section__title">Leden beheren</h2>
        </div>

        {team.pokemonIds.length === 0 ? (
          <EmptyState title="Dit team is nog leeg">
            Gebruik de picker hierboven of voeg Pokémon toe vanuit de{" "}
            <Link to="/list">Pokédex</Link>.
          </EmptyState>
        ) : (
          <div className="pokemon-grid">
            {team.pokemonIds.map((pokemonId) => (
              <PokemonCard
                key={pokemonId}
                id={pokemonId}
                action={
                  <button
                    type="button"
                    className="btn btn--danger btn--small"
                    onClick={() => removePokemonFromTeam(team.id, pokemonId)}
                  >
                    Verwijderen
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
