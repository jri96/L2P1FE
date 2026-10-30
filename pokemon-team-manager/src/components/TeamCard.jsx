import { useState } from "react";
import { Link } from "react-router-dom";
import { MAX_TEAM_SIZE, useApp } from "../context/AppContext";
import TeamSlots from "./TeamSlots";

/** Overzichtskaart van één team op de /teams-pagina. */
export default function TeamCard({ team }) {
  const { deleteTeam } = useApp();
  const [confirming, setConfirming] = useState(false);

  return (
    <article className="team-card">
      <header className="team-card__header">
        <div>
          <h3 className="team-card__title">{team.name}</h3>
          <p className="team-card__meta">
            {team.pokemonIds.length}/{MAX_TEAM_SIZE} leden · aangemaakt {team.createdAt}
          </p>
        </div>
        <span className="badge">{team.pokemonIds.length}</span>
      </header>

      <TeamSlots pokemonIds={team.pokemonIds} />

      <footer className="team-card__footer">
        <Link to={`/teams/${team.id}`} className="btn btn--primary btn--small">
          Openen
        </Link>

        {confirming ? (
          <span className="confirm-row">
            <button
              type="button"
              className="btn btn--danger btn--small"
              onClick={() => deleteTeam(team.id)}
            >
              Ja, verwijder
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => setConfirming(false)}
            >
              Annuleer
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setConfirming(true)}
          >
            Verwijderen
          </button>
        )}
      </footer>
    </article>
  );
}
