import type { UserGrowthPoint } from "../lib/user-metrics";

// Vert de marque assombri pour passer la bande de clarté du mode sombre —
// validé via `validate_palette.js` (skill dataviz) contre la surface des
// cartes (#72c900 brut échoue cette bande, trop clair pour un aplat de
// graphique même s'il passe le contraste).
const BAR_COLOR = "#5a9e00";
const AXIS_COLOR = "#383835";

interface UserGrowthChartProps {
  points: UserGrowthPoint[];
}

/** Dessine un rectangle aux coins arrondis en haut seulement, carré à la base (spec barre de la skill dataviz). */
function roundedTopBarPath(x: number, y: number, width: number, height: number, radius: number): string {
  if (height <= 0) return "";
  const r = Math.min(radius, width / 2, height);
  const bottom = y + height;
  return `M${x},${bottom} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${bottom} Z`;
}

/**
 * Barres verticales — un seul point par jour, une seule série (pas de
 * légende nécessaire, voir `marks-and-anatomy.md`). Info-bulle native
 * (`<title>`) sur chaque barre : rien n'est accessible uniquement au survol.
 */
export function UserGrowthChart({ points }: UserGrowthChartProps) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const width = 720;
  const height = 200;
  const paddingBottom = 24;
  const slot = width / points.length;
  const barWidth = Math.min(24, slot - 2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-48 w-full"
      role="img"
      aria-label={`Nouvelles inscriptions par jour, de ${points[0]?.date} à ${points.at(-1)?.date}`}
    >
      <line
        x1={0}
        y1={height - paddingBottom}
        x2={width}
        y2={height - paddingBottom}
        stroke={AXIS_COLOR}
        strokeWidth={1}
      />
      {points.map((point, index) => {
        const barHeight = point.count === 0 ? 0 : Math.max(3, (point.count / max) * (height - paddingBottom - 12));
        const x = index * slot + (slot - barWidth) / 2;
        const y = height - paddingBottom - barHeight;
        const path = roundedTopBarPath(x, y, barWidth, barHeight, 4);
        if (!path) return null;
        return (
          <path key={point.date} d={path} fill={BAR_COLOR}>
            <title>{`${point.date} — ${point.count} inscription${point.count > 1 ? "s" : ""}`}</title>
          </path>
        );
      })}
    </svg>
  );
}
