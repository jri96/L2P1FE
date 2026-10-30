/** Drie kleine, herbruikbare "feedback"-componenten. */

/** Draaiende indicator tijdens het ophalen van data. */
export function Spinner({ label = "Laden…" }) {
  return (
    <div className="spinner" role="status">
      <span className="spinner__dot" aria-hidden="true" />
      {label}
    </div>
  );
}

/** Foutmelding met een "opnieuw proberen"-knop. */
export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="notice notice--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Opnieuw proberen
        </button>
      )}
    </div>
  );
}

/** Leeg scherm met uitleg en een actie. */
export function EmptyState({ title, children, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <div className="empty-state__text">{children}</div>
      {action}
    </div>
  );
}

/** Grijs blok dat de vorm van een kaart aanhoudt terwijl data laadt. */
export function CardSkeleton() {
  return (
    <div className="pokemon-card is-skeleton" aria-hidden="true">
      <div className="skeleton skeleton--art" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line short" />
      <div className="skeleton skeleton--chips" />
    </div>
  );
}
