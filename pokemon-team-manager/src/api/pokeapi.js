/**
 * Alle communicatie met de PokéAPI staat in dit bestand.
 * Componenten roepen alleen functies uit dit bestand aan, zodat de UI
 * los blijft van de databron (scheiding frontend / backend).
 *
 * API-documentatie: https://pokeapi.co/docs/v2.0
 * Base-URL:          https://pokeapi.co/api/v2
 */

const BASE_URL = "https://pokeapi.co/api/v2";

/** De 18 "officiële" hoofdtypen + kleuren (voor de chips en de type-filter). */
export const TYPES = [
  { name: "normal", color: "#A8A77A" },
  { name: "fighting", color: "#C22E28" },
  { name: "flying", color: "#A98FF3" },
  { name: "poison", color: "#A33EA1" },
  { name: "ground", color: "#E2BF65" },
  { name: "rock", color: "#B6A136" },
  { name: "bug", color: "#A6B91A" },
  { name: "ghost", color: "#735797" },
  { name: "steel", color: "#B7B7CE" },
  { name: "fire", color: "#F08030" },
  { name: "water", color: "#6390F0" },
  { name: "grass", color: "#78C850" },
  { name: "electric", color: "#F7D02C" },
  { name: "psychic", color: "#F95587" },
  { name: "ice", color: "#96D9D6" },
  { name: "dragon", color: "#6F35FC" },
  { name: "dark", color: "#705746" },
  { name: "fairy", color: "#D685AD" },
];

/** Nederlandse/Engelse labels voor de statistieken. */
export const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

/** Kleur van een type (onbekend type → grijs). */
export function typeColor(type) {
  return TYPES.find((t) => t.name === type)?.color ?? "#777788";
}

/** "mr-mime" → "Mr Mime", "hidden-power" → "Hidden Power". */
export function formatName(name = "") {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Haalt het id uit een URL als die van de PokéAPI:
 *  "https://pokeapi.co/api/v2/pokemon/25/" → 25 */
export function idFromUrl(url) {
  const parts = url.replace(/\/+$/, "").split("/");
  return Number(parts[parts.length - 1]);
}

/**
 * Basis helper: doet de fetch en gooit een duidelijke fout (in het Nederlands)
 * wanneer de API niet bereikbaar is of een foutcode teruggeeft.
 */
async function getJSON(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("Geen verbinding met de PokéAPI. Controleer je internetverbinding.");
  }
  if (!response.ok) {
    throw new Error(`De PokéAPI gaf een fout terug (HTTP ${response.status}).`);
  }
  return response.json();
}

/* ---------------------------------------------------------------
   1. Lijst met alle Pokémon (namen) — één request voor 1025 Pokémon
--------------------------------------------------------------- */
let pokedexRequest = null; // dezelfde lijst maar één keer ophalen

export function fetchPokedex(limit = 1025) {
  if (!pokedexRequest) {
    pokedexRequest = getJSON(`${BASE_URL}/pokemon?limit=${limit}&offset=0`)
      .then((data) =>
        data.results.map((entry) => ({
          id: idFromUrl(entry.url),
          name: entry.name,
        })),
      )
      .catch((error) => {
        pokedexRequest = null; // bij een fout opnieuw proberen
        throw error;
      });
  }
  return pokedexRequest;
}

/* ---------------------------------------------------------------
   2. Detail van één Pokémon — gecached, zodat we nooit 2× ophalen
--------------------------------------------------------------- */
const detailCache = new Map(); // bewaart op zowel id als naam
const pendingRequests = new Map();

/** Normaliseert het ruwe antwoord tot een overzichtelijk object. */
function normalizePokemon(data) {
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    height: data.height / 10, // hectometer → meter
    weight: data.weight / 10, // hectogram → kilogram
    baseExperience: data.base_experience,
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    abilities: data.abilities.map((a) => ({
      name: a.ability.name,
      hidden: a.hidden,
    })),
    moves: data.moves.slice(0, 16).map((m) => m.move.name),
    sprite:
      data.sprites.other?.["official-artwork"]?.front_default ??
      data.sprites.front_default,
  };
}

export function fetchPokemon(key) {
  const cacheKey = String(key).toLowerCase();

  if (detailCache.has(cacheKey)) {
    return Promise.resolve(detailCache.get(cacheKey));
  }
  // Dezelfde request loopt al → hergebruik die Promise
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = getJSON(`${BASE_URL}/pokemon/${cacheKey}`)
    .then((data) => {
      const pokemon = normalizePokemon(data);
      detailCache.set(cacheKey, pokemon);
      detailCache.set(pokemon.id, pokemon);
      pendingRequests.delete(cacheKey);
      return pokemon;
    })
    .catch((error) => {
      pendingRequests.delete(cacheKey);
      throw error;
    });

  pendingRequests.set(cacheKey, request);
  return request;
}

/* ---------------------------------------------------------------
   3. "Species": beschrijving en categorie (voor het Over-vlak)
--------------------------------------------------------------- */
const speciesCache = new Map();

export async function fetchSpecies(id) {
  const cacheKey = String(id);
  if (speciesCache.has(cacheKey)) return speciesCache.get(cacheKey);

  const data = await getJSON(`${BASE_URL}/pokemon-species/${cacheKey}`);

  const flavor =
    data.flavor_text_entries.find((e) => e.language.name === "nl") ??
    data.flavor_text_entries.find((e) => e.language.name === "en") ??
    null;
  const genus =
    data.genera.find((g) => g.language.name === "en")?.genus ?? "Pokémon";

  const species = {
    genus,
    // \f, \n en dubbele spaties gladstrijken
    description: flavor ? flavor.text.replace(/[\n\f\r]+/g, " ").trim() : "",
    generation: formatName(data.generation.name.replace("generation-", "")),
  };

  speciesCache.set(cacheKey, species);
  return species;
}

/* ---------------------------------------------------------------
   4. Filteren op type: 1 request in plaats van 1025
   /type/{type} geeft direct alle Pokémon van dat type.
--------------------------------------------------------------- */
const typePokemonCache = new Map();

export async function fetchPokemonByType(type) {
  if (!type || type === "all") return null;
  if (typePokemonCache.has(type)) return typePokemonCache.get(type);

  const request = getJSON(`${BASE_URL}/type/${type}`)
    .then((data) => {
      const names = new Set(data.pokemon.map((p) => p.pokemon.name));
      typePokemonCache.set(type, names);
      return names;
    })
    .catch((error) => {
      typePokemonCache.delete(type); // mislukt? volgende keer opnieuw proberen
      throw error;
    });

  typePokemonCache.set(type, request);
  return request;
}

/* ---------------------------------------------------------------
   5. Hulpje: kleine sprite-URL op basis van het id.
   Dezelfde structuur als de sprites die de PokéAPI teruggeeft,
   maar zonder dat we daar een extra request voor nodig hebben.
--------------------------------------------------------------- */
export function spriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
