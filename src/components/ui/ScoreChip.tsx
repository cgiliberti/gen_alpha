interface ScoreChipProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md';
}

export default function ScoreChip({ score, label, size = 'md' }: ScoreChipProps) {
  const bgColor =
    score >= 8
      ? 'bg-green-100 text-green-800'
      : score >= 5
      ? 'bg-amber-100 text-amber-800'
      : 'bg-red-100 text-red-700';

  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${bgColor} ${sizeClass}`}>
      {label && <span className="font-normal opacity-75">{label}</span>}
      {score.toFixed(1)}
    </span>
  );
}
