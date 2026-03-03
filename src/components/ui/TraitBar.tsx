import { TRAIT_COLORS, TRAIT_LABELS, TraitKey } from '@/types';

interface TraitBarProps {
  trait: TraitKey;
  score: number | null;
  showLabel?: boolean;
}

export default function TraitBar({ trait, score, showLabel = true }: TraitBarProps) {
  const color = TRAIT_COLORS[trait];
  const label = TRAIT_LABELS[trait];
  const pct = score !== null ? (score / 10) * 100 : 0;

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{label}</span>
          <span className="font-semibold text-gray-700">
            {score !== null ? score.toFixed(1) : '—'}
          </span>
        </div>
      )}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
