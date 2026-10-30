/** Zoeken + sorteren + pagineren, gedeeld door Pokédex en Favorieten. */

/**
 * @param {{id:number, name:string}[]} pokemons
 * @param {{query?:string, typeNames?:Set<string>|null, sort?:string}} options
 */
export function filterAndSort(pokemons, { query = "", typeNames = null, sort = "id-asc" } = {}) {
  const search = query.trim().toLowerCase();
  const isNumber = /^\d+$/.test(search);

  const filtered = pokemons.filter((pokemon) => {
    // Type-filter: alleen Pokémon die in de opgehaalde types-set zitten
    if (typeNames && !typeNames.has(pokemon.name)) return false;
    if (!search) return true;
    if (isNumber) return String(pokemon.id).startsWith(search);
    return pokemon.name.includes(search);
  });

  const sorted = [...filtered];
  switch (sort) {
    case "id-desc":
      sorted.sort((a, b) => b.id - a.id);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      sorted.sort((a, b) => a.id - b.id);
  }
  return sorted;
}

/** Snipt een lijst in pagina's (standaard 24 kaarten per pagina). */
export function paginate(items, page, perPage = 24) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * perPage, safePage * perPage),
    page: safePage,
    totalPages,
  };
}

/** Maakt een paginering-rij: [1, "…", 4, 5, 6, "…", 20] */
export function pageNumbers(page, totalPages, span = 1) {
  const pages = new Set([1, totalPages, page]);
  for (let offset = 1; offset <= span; offset += 1) {
    pages.add(page - offset);
    pages.add(page + offset);
  }

  const valid = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  valid.forEach((p, index) => {
    if (index > 0 && p - valid[index - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
}
