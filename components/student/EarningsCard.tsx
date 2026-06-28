'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useEarningsSummary } from '@/hooks/useEarnings';

export function EarningsCard() {
  const summary = useEarningsSummary();

  if (!summary) return null;

  const maxAmount = Math.max(...summary.earningsByMonth.map((m) => m.amount), 1);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Earnings</h3>
        <Link href="/student/earnings" className="text-xs font-medium text-primary hover:underline">
          View all →
        </Link>
      </div>

      {/* Main stats */}
      <div className="flex bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-gray-900">£{summary.thisMonth.toFixed(2)}</p>
          <p className="text-xs text-text-secondary mt-0.5">This month</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-gray-900">£{summary.thisYear.toFixed(2)}</p>
          <p className="text-xs text-text-secondary mt-0.5">This year</p>
        </div>
      </div>

      {/* Mini bar chart */}
      {summary.earningsByMonth.some((m) => m.amount > 0) && (
        <div className="mb-3">
          <p className="text-xs text-text-secondary mb-2">Last 6 months</p>
          <div className="flex items-end justify-between h-20 gap-2">
            {summary.earningsByMonth.map((month, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-6 rounded-sm"
                  style={{
                    height: `${Math.max((month.amount / maxAmount) * 60, 4)}px`,
                    backgroundColor: month.amount > 0 ? '#2563EB' : '#E5E7EB',
                  }}
                />
                <span className="text-xs text-gray-400">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary stats */}
      <div className="flex justify-between pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{summary.totalHours}h</p>
          <p className="text-xs text-text-secondary mt-0.5">Total hours</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">£{summary.averageHourlyRate.toFixed(2)}</p>
          <p className="text-xs text-text-secondary mt-0.5">Avg hourly</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">£{summary.totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-text-secondary mt-0.5">All time</p>
        </div>
      </div>
    </Card>
  );
}
