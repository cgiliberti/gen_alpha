'use client';

import { TRAIT_COLORS } from '@/types';

interface TraitRadarProps {
  agency: number | null;
  orthogonalThinking: number | null;
  curiosity: number | null;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 75;
const LABEL_RADIUS = 95;

// Triangle vertices at top, bottom-right, bottom-left
const ANGLES = [-90, 30, 150]; // degrees from 12 o'clock
const TRAITS: Array<{
  key: 'agency' | 'orthogonalThinking' | 'curiosity';
  label: string;
  angle: number;
}> = [
  { key: 'agency', label: 'Agency', angle: ANGLES[0] },
  { key: 'curiosity', label: 'Curiosity', angle: ANGLES[1] },
  { key: 'orthogonalThinking', label: 'Orthogonal', angle: ANGLES[2] },
];

function toCartesian(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  };
}

export default function TraitRadar({ agency, orthogonalThinking, curiosity }: TraitRadarProps) {
  const values = {
    agency: agency ?? 0,
    orthogonalThinking: orthogonalThinking ?? 0,
    curiosity: curiosity ?? 0,
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Build grid polygon points for each level
  const gridPolygons = gridLevels.map((level) => {
    const pts = TRAITS.map(({ angle }) => {
      const p = toCartesian(angle, RADIUS * level);
      return `${p.x},${p.y}`;
    });
    return pts.join(' ');
  });

  // Data polygon
  const dataPoints = TRAITS.map(({ key, angle }) => {
    const ratio = values[key] / 10;
    const p = toCartesian(angle, RADIUS * ratio);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-xs mx-auto">
      {/* Grid */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {TRAITS.map(({ angle, key }) => {
        const end = toCartesian(angle, RADIUS);
        return (
          <line
            key={key}
            x1={CENTER}
            y1={CENTER}
            x2={end.x}
            y2={end.y}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        );
      })}
      {/* Data area */}
      <polygon
        points={dataPoints}
        fill="#6366f120"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {TRAITS.map(({ key, angle }) => {
        const ratio = values[key] / 10;
        const p = toCartesian(angle, RADIUS * ratio);
        return (
          <circle
            key={key}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={TRAIT_COLORS[key]}
            stroke="white"
            strokeWidth="1.5"
          />
        );
      })}
      {/* Labels */}
      {TRAITS.map(({ label, angle, key }) => {
        const p = toCartesian(angle, LABEL_RADIUS);
        return (
          <text
            key={key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#64748b"
            fontWeight="500"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
