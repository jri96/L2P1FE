/**
 * Hooks die de PokéAPI-functies in componenten bruikbaar maken.
 *
 * Patroon: we bewaren wélke aanvraag al klaar is (`requested`) in plaats van
 * een `setLoading(true)` aan het begin van een effect. Zo is er geen
 * setState nodig in het effect zelf — loading is simpelweg "de gevraagde
 * data is er nog niet".
 */
import { useCallback, useEffect, useState } from "react";
import {
  fetchPokemon,
  fetchPokemonByType,
  fetchPokedex,
  fetchSpecies,
} from "../api/pokeapi";

/** Lijst met alle Pokémon (namen + id's). */
export function usePokedex(limit = 1025) {
  const [status, setStatus] = useState({ requested: null, data: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchPokedex(limit)
      .then((data) => {
        if (!cancelled) setStatus({ requested: limit, data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setStatus({ requested: limit, data: [], error });
      });

    return () => {
      cancelled = true;
    };
  }, [limit, attempt]);

  const matches = status.requested === limit;
  const retry = useCallback(() => {
    setStatus({ requested: null, data: [], error: null });
    setAttempt((value) => value + 1);
  }, []);

  return {
    pokemons: status.data,
    loading: !matches,
    error: matches ? status.error : null,
    retry,
  };
}

/** Detail van één Pokémon. Geef je geen key, dan gebeurt er niets. */
export function usePokemon(key) {
  const [status, setStatus] = useState({ requested: null, data: null, error: null });

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;

    fetchPokemon(key)
      .then((data) => {
        if (!cancelled) setStatus({ requested: key, data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setStatus({ requested: key, data: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const matches = Boolean(key) && status.requested === key;
  return {
    pokemon: matches ? status.data : null,
    loading: Boolean(key) && !matches,
    error: matches ? status.error : null,
  };
}

/** Beschrijving + categorie van één Pokémon (species-endpoint). */
export function useSpecies(id) {
  const [status, setStatus] = useState({ requested: null, data: null, error: null });

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    fetchSpecies(id)
      .then((data) => {
        if (!cancelled) setStatus({ requested: String(id), data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setStatus({ requested: String(id), data: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const matches = Boolean(id) && status.requested === String(id);
  return {
    species: matches ? status.data : null,
    loading: Boolean(id) && !matches,
    error: matches ? status.error : null,
  };
}

/**
 * Namen van alle Pokémon van één type.
 * Levert een Set op zodat we snel kunnen checken of een Pokémon in de
 * filter past (1 request voor het hele type, in plaats van 1025 requests).
 */
export function usePokemonByType(type) {
  const [status, setStatus] = useState({ requested: null, names: null, error: null });

  const active = Boolean(type) && type !== "all";

  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;

    fetchPokemonByType(type)
      .then((names) => {
        if (!cancelled) setStatus({ requested: type, names, error: null });
      })
      .catch((error) => {
        if (!cancelled) setStatus({ requested: type, names: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [type, active]);

  const matches = active && status.requested === type;
  return {
    names: matches ? status.names : null,
    loading: active && !matches,
    error: matches ? status.error : null,
  };
}
