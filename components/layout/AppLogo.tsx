import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AppLogo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('text-xl font-bold flex-shrink-0', className)}>
      <span className="text-primary">Student</span><span className="text-secondary">Shift</span>
    </Link>
  );
}
