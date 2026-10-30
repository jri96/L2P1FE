import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { usePokedex } from "../hooks/usePokeApi";

/** Welkomstscherm: uitleg, cijfers en doorverwijzingen. */
export default function Home() {
  const { teams, favorites } = useApp();
  const { pokemons, loading } = usePokedex();

  return (
    <div className="page page--home">
      <section className="hero">
        <div className="hero__ball" aria-hidden="true" />
        <p className="hero__eyebrow">Zakelijk teambeheer, maar dan met Pokémon</p>
        <h1>Bouw je perfecte Pokémon-team</h1>
        <p className="hero__text">
          Zoek Pokémon op in de Pokédex, bewaar je favorieten en stel teams samen.
          Alle data komt live uit de PokéAPI — jij beheert de selectie.
        </p>
        <div className="hero__actions">
          <Link to="/list" className="btn btn--primary">
            Naar de Pokédex →
          </Link>
          <Link to="/teams" className="btn btn--ghost">
            Mijn teams
          </Link>
        </div>
      </section>

      <section className="stat-grid" aria-label="Overzicht">
        <div className="stat-card">
          <strong>{teams.length}</strong>
          <span>{teams.length === 1 ? "Team aangemaakt" : "Teams aangemaakt"}</span>
        </div>
        <div className="stat-card">
          <strong>{favorites.length}</strong>
          <span>Favoriete Pokémon</span>
        </div>
        <div className="stat-card">
          <strong>{loading ? "…" : pokemons.length}</strong>
          <span>Pokémon beschikbaar</span>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Zo werkt het</h2>
        <div className="step-grid">
          <article className="step-card">
            <span className="step-card__number">1</span>
            <h3>Zoek &amp; filter</h3>
            <p>Zoek op naam of nummer, filter op type en sorteer de lijst zoals jij wilt.</p>
          </article>
          <article className="step-card">
            <span className="step-card__number">2</span>
            <h3>Bewaar favorieten</h3>
            <p>Klik op het hartje van een kaart en vind je favorieten later meteen terug.</p>
          </article>
          <article className="step-card">
            <span className="step-card__number">3</span>
            <h3>Stel je team samen</h3>
            <p>Maximaal 6 Pokémon per team: toevoegen en verwijderen gebeurt met één klik.</p>
          </article>
        </div>
      </section>

      <section className="section section--callout">
        <div>
          <h2 className="section__title">Direct aan de slag</h2>
          <p className="muted">
            Begin bij je favorieten en zet er in één keer een team van neer — handig als je
            al weet wie erin moet.
          </p>
        </div>
        <Link to="/favorieten" className="btn btn--dark">
          Naar mijn favorieten
        </Link>
      </section>
    </div>
  );
}
