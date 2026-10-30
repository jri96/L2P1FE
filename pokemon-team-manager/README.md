# Pokémon Team Manager

Zakelijke applicatie waarin je Pokémon-teams aanmaakt en beheert. Data komt live uit de [PokéAPI](https://pokeapi.co).

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint       # oxlint (0 fouten)
npm run build      # productie-build
```

## Draaiende opdrachten

| Commando | Wat het doet |
|---|---|
| `npm run wireframes` | Bekijk de wireframes in de browser (`http://localhost:5199`) |
| `npm run wireframes:images` | Exporteer alle wireframes naar `wireframes/images/*.png` (voor je Word-document) |
| `npm run smoke` | Opent de app in headless Chrome, loopt alle routes en interacties af → `screenshots/` |

> **Let op voor inlevering:** `wireframes/images/` zijn de wireframes, `screenshots/` zijn
> foto's van de echte app. Gebruik die laatste niet als wireframe.

## Schermen (routing — react-router-dom)

| Pad | Pagina | Bestand |
|---|---|---|
| `/` | Home | `src/pages/Home.jsx` |
| `/list` | Pokédex: zoeken, filteren, sorteren, pagineren | `src/pages/List.jsx` |
| `/detail/:id` | Detail van één Pokémon | `src/pages/Detail.jsx` |
| `/teams` | Overzicht van teams + nieuw team | `src/pages/Teams.jsx` |
| `/teams/:id` | Team beheren (leden toevoegen/verwijderen) | `src/pages/TeamDetail.jsx` |
| `/favorieten` | Favorieten + "team maken van favorieten" | `src/pages/Favorites.jsx` |

Alle routes hangen onder `<Layout />` (Header, Navigation, Footer, meldingen).

## Structuur

```
src/
  api/pokeapi.js        alle fetch-aanroepen + cache (gescheiden van de UI)
  hooks/usePokeApi.js   usePokedex, usePokemon, useSpecies, usePokemonByType
  context/AppContext.jsx  teams + favorieten state (useState) en alle acties
  components/           herbruikbare stukken: PokemonCard, FilterBar, TeamSlots,
                        Modal, TypeChip, StatBar, Header/Navigation/Footer, Toast …
  pages/                de schermen
  utils/pokemonQuery.js zoeken, sorteren en pagineren (gedeeld door twee pagina's)
```

## Belangrijke keuzes

- **State:** alleen `useState`, via een Context zodat elk scherm dezelfde data ziet.
  Bewust géén localStorage/zustand/redux.
- **Teams:** maximaal 6 Pokémon, geen duplicaten — beide worden gecontroleerd in
  `addPokemonToTeam`, met een melding (Toast) als het niet lukt.
- **API-calls:** `fetch` + `useEffect` met `cancelled`-vlag zodat er geen losse
  setState-aanroepen in het effect staan enavigatie geen races oplevert.
- **Cachen:** de lijst met 1025 Pokémon en de details worden per sessie één keer
  opgehaald; het type-filter gebruikt één `/type/{type}`-request in plaats van 1025.
