/**
 * Alle applicatie-state (teams + favorieten) staat in één Context.
 *
 * Waarom? De data wordt op meerdere schermen gebruikt (Home, Lijst, Detail,
 * Teams, Favorieten). Zonder Context zouden we overal props moeten doorgeven
 * (prop drilling). We slaan alles op met useState — er wordt bewust géén
 * externe library (zustand/redux) of localStorage gebruikt.
 *
 * AppProvider (component) en useApp (hook) horen bij elkaar; daarom staan
 * ze bewust in hetzelfde bestand.
 */
/* oxlint-disable react/only-export-components -- component + bijbehorende hook */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

/** Een team mag maximaal 6 Pokémon bevatten. */
export const MAX_TEAM_SIZE = 6;

let idCounter = 0;
const createId = () => `team-${Date.now().toString(36)}-${idCounter++}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

/** Beginstand, zodat er meteen iets te zien is in de app. */
const INITIAL_TEAMS = [
  { id: "team-starters", name: "Kanto Starters", pokemonIds: [1, 4, 7], createdAt: formatDate("2026-09-12") },
  { id: "team-thunder", name: "Thunder Squad", pokemonIds: [25, 26], createdAt: formatDate("2026-09-14") },
];

const INITIAL_FAVORITES = [25, 133, 6, 9];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);
  const [toast, setToast] = useState(null);

  /** Toont een melding rechts onderin (automatisch weer weg). */
  const notify = useCallback((message, kind = "success") => {
    const id = Date.now();
    setToast({ id, message, kind });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3200);
  }, []);

  /* ------------------------- teams ------------------------- */

  const createTeam = useCallback(
    (name, initialIds = []) => {
      const trimmed = name.trim();
      if (!trimmed) {
        notify("Vul eerst een naam in voor je team.", "error");
        return null;
      }

      const team = {
        id: createId(),
        name: trimmed,
        pokemonIds: [...new Set(initialIds)].slice(0, MAX_TEAM_SIZE),
        createdAt: formatDate(Date.now()),
      };

      setTeams((current) => [...current, team]);
      notify(`Team "${team.name}" is aangemaakt.`);
      return team;
    },
    [notify],
  );

  const deleteTeam = useCallback(
    (teamId) => {
      const team = teams.find((t) => t.id === teamId);
      setTeams((current) => current.filter((t) => t.id !== teamId));
      if (team) notify(`Team "${team.name}" is verwijderd.`);
    },
    [teams, notify],
  );

  const renameTeam = useCallback(
    (teamId, name) => {
      const trimmed = name.trim();
      if (!trimmed) {
        notify("Een teamnaam mag niet leeg zijn.", "error");
        return false;
      }
      setTeams((current) =>
        current.map((team) => (team.id === teamId ? { ...team, name: trimmed } : team)),
      );
      notify("Team hernoemd.");
      return true;
    },
    [notify],
  );

  const addPokemonToTeam = useCallback(
    (teamId, pokemonId) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return false;

      if (team.pokemonIds.includes(pokemonId)) {
        notify("Die Pokémon zit al in dit team.", "error");
        return false;
      }
      if (team.pokemonIds.length >= MAX_TEAM_SIZE) {
        notify(`Een team mag maximaal ${MAX_TEAM_SIZE} Pokémon bevatten.`, "error");
        return false;
      }

      setTeams((current) =>
        current.map((t) =>
          t.id === teamId ? { ...t, pokemonIds: [...t.pokemonIds, pokemonId] } : t,
        ),
      );
      notify(`Toegevoegd aan "${team.name}".`);
      return true;
    },
    [teams, notify],
  );

  const removePokemonFromTeam = useCallback(
    (teamId, pokemonId) => {
      setTeams((current) =>
        current.map((team) =>
          team.id === teamId
            ? { ...team, pokemonIds: team.pokemonIds.filter((id) => id !== pokemonId) }
            : team,
        ),
      );
      notify("Pokémon verwijderd uit het team.");
    },
    [notify],
  );

  /* ------------------------ favorieten ------------------------ */

  const toggleFavorite = useCallback(
    (pokemonId) => {
      const wasFavorite = favorites.includes(pokemonId);
      setFavorites((current) =>
        wasFavorite ? current.filter((id) => id !== pokemonId) : [...current, pokemonId],
      );
      notify(wasFavorite ? "Uit favorieten verwijderd." : "Toegevoegd aan favorieten.");
      return !wasFavorite;
    },
    [favorites, notify],
  );

  /** Maakt in één keer een team van (de eerste MAX_TEAM_SIZE) favorieten. */
  const createTeamFromFavorites = useCallback(() => {
    if (favorites.length === 0) {
      notify("Je hebt nog geen favorieten. Klik op een hartje om te bewaren.", "error");
      return null;
    }
    const team = createTeam("Favorieten", favorites);
    if (favorites.length > MAX_TEAM_SIZE) {
      notify(
        `Alleen de eerste ${MAX_TEAM_SIZE} favorieten passen in een team.`,
        "info",
      );
    }
    return team;
  }, [createTeam, favorites, notify]);

  /* ------------------------- derived ------------------------- */

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const isFavorite = useCallback((id) => favoriteSet.has(id), [favoriteSet]);

  const value = useMemo(
    () => ({
      teams,
      favorites,
      favoriteSet,
      toast,
      notify,
      isFavorite,
      createTeam,
      deleteTeam,
      renameTeam,
      addPokemonToTeam,
      removePokemonFromTeam,
      toggleFavorite,
      createTeamFromFavorites,
    }),
    [
      teams,
      favorites,
      favoriteSet,
      toast,
      notify,
      isFavorite,
      createTeam,
      deleteTeam,
      renameTeam,
      addPokemonToTeam,
      removePokemonFromTeam,
      toggleFavorite,
      createTeamFromFavorites,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook om bij de applicatie-state te kunnen. */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp() moet binnen <AppProvider> gebruikt worden.");
  }
  return context;
}
