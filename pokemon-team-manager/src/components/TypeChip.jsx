import { formatName, typeColor } from "../api/pokeapi";

/** Bepaalt leesbare tekstkleur op basis van de achtergrondkleur. */
function readableText(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = hex.slice(3, 5), b = hex.slice(5, 7);
  const brightness = (0.299 * r + 0.587 * parseInt(g, 16) + 0.114 * parseInt(b, 16)) / 255;
  return brightness > 0.62 ? "#1b1b2a" : "#ffffff";
}

/** Kleurvolle type-chip, bijv. "Grass". Herbruikbaar op kaart en detail. */
export default function TypeChip({ type }) {
  const background = typeColor(type);
  return (
    <span className="type-chip" style={{ background, color: readableText(background) }}>
      {formatName(type)}
    </span>
  );
}
