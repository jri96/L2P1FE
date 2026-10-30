import { STAT_LABELS } from "../api/pokeapi";

/** Balkje voor één statistiek op de detailpagina. */
export default function StatBar({ name, value, max = 160 }) {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="stat-bar">
      <span className="stat-bar__label">{STAT_LABELS[name] ?? name}</span>
      <span className="stat-bar__value">{value}</span>
      <div
        className="stat-bar__track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={STAT_LABELS[name] ?? name}
      >
        <span className="stat-bar__fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
