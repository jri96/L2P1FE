import { useState } from "react";
import { EmptyState } from "../components/Feedback";
import TeamCard from "../components/TeamCard";
import { useApp } from "../context/AppContext";

/** Overzicht van alle teams + formulier om een nieuw team aan te maken. */
export default function Teams() {
  const { teams, createTeam } = useApp();
  const [name, setName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const team = createTeam(name);
    if (team) setName("");
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Mijn teams</h1>
          <p className="muted">
            {teams.length === 0
              ? "Je hebt nog geen teams."
              : `${teams.length} ${teams.length === 1 ? "team" : "teams"} · klik op openen om leden te beheren.`}
          </p>
        </div>
      </header>

      <form className="new-team" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Naam van je nieuwe team…"
          aria-label="Naam van het nieuwe team"
        />
        <button type="submit" className="btn btn--primary">
          ＋ Nieuw team
        </button>
      </form>

      {teams.length === 0 ? (
        <EmptyState title="Nog geen teams">
          Maak hierboven je eerste team en vul het daarna vanuit de Pokédex of je favorieten.
        </EmptyState>
      ) : (
        <div className="team-grid">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
