'use client';

interface ReadinessScoreRingProps {
  score: number;
  color: string;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export function ReadinessScoreRing({ score, color, label, size = 120, strokeWidth = 10 }: ReadinessScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const cx = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-gray-900" style={{ fontSize: size * 0.22 }}>{score}%</span>
        <span className="font-medium text-center leading-tight" style={{ fontSize: size * 0.11, color }}>{label}</span>
      </div>
    </div>
  );
}
