import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  className?: string;
  height?: 'sm' | 'md';
}

export function ProgressBar({ value, color = '#2563EB', className, height = 'md' }: ProgressBarProps) {
  const heights = { sm: 'h-1.5', md: 'h-2.5' };
  return (
    <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', heights[height], className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}
