'use client';

import { useState } from 'react';
import { useEarnings, useEarningsSummary, useLogEarning, useDeleteEarning } from '@/hooks/useEarnings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/SkeletonCard';
import { useToast } from '@/components/providers/ToastProvider';
import { formatAbsoluteDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EarningsPage() {
  const { data: earnings, isLoading } = useEarnings();
  const summary = useEarningsSummary();
  const logEarning = useLogEarning();
  const deleteEarning = useDeleteEarning();
  const { showSuccess, showError } = useToast();
  const [logOpen, setLogOpen] = useState(false);
  const [form, setForm] = useState({ hourly_rate: '', hours_worked: '', date: new Date().toISOString().split('T')[0], description: '' });

  const rateNum = parseFloat(form.hourly_rate);
  const hoursNum = parseFloat(form.hours_worked);
  const computedAmount = !isNaN(rateNum) && !isNaN(hoursNum) ? rateNum * hoursNum : null;

  const handleLog = async () => {
    if (!form.hourly_rate || !form.hours_worked || !form.date) {
      showError('Please fill in hourly rate, hours, and date.'); return;
    }
    try {
      await logEarning.mutateAsync({
        amount: parseFloat(form.hourly_rate) * parseFloat(form.hours_worked),
        hours_worked: parseFloat(form.hours_worked),
        date: form.date,
        description: form.description || undefined,
      });
      showSuccess('Earnings logged!');
      setLogOpen(false);
      setForm({ hourly_rate: '', hours_worked: '', date: new Date().toISOString().split('T')[0], description: '' });
    } catch { showError('Could not log earnings.'); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <Button onClick={() => setLogOpen(true)}>Log earnings</Button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total earned', value: `£${summary.totalEarnings.toFixed(2)}` },
            { label: 'Total hours', value: `${summary.totalHours.toFixed(1)} hrs` },
            { label: 'Avg rate', value: `£${summary.averageHourlyRate.toFixed(2)}/hr` },
            { label: 'This month', value: `£${summary.thisMonth.toFixed(2)}` },
            { label: 'This year', value: `£${summary.thisYear.toFixed(2)}` },
          ].map(({ label, value }) => (
            <Card key={label} padding="md">
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Chart */}
      {summary && summary.earningsByMonth.some((m) => m.amount > 0) && (
        <Card padding="lg" className="mb-6">
          <p className="text-sm font-semibold text-gray-900 mb-4">Earnings by month</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={summary.earningsByMonth}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `£${v}`} />
              <Tooltip formatter={(v: number) => [`£${v.toFixed(2)}`, 'Earnings']} />
              <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Log list */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Earnings log</h2>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : !earnings?.length ? (
          <EmptyState title="No earnings logged" description="Log your first shift earnings above." />
        ) : (
          <div className="space-y-2">
            {earnings.map((e) => (
              <div key={e.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">£{e.amount.toFixed(2)} · {e.hours_worked} hrs · £{(e.amount / e.hours_worked).toFixed(2)}/hr</p>
                  <p className="text-xs text-text-secondary">{formatAbsoluteDate(e.date)}{e.description && ` · ${e.description}`}</p>
                </div>
                <button
                  onClick={() => { deleteEarning.mutate(e.id); }}
                  className="text-gray-400 hover:text-error"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log modal */}
      <Modal open={logOpen} onClose={() => setLogOpen(false)} title="Log earnings">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Hourly rate (£)" type="number" min="0" step="0.01" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} placeholder="0.00" />
            <Input label="Hours worked" type="number" min="0" step="0.5" value={form.hours_worked} onChange={(e) => setForm({ ...form, hours_worked: e.target.value })} placeholder="0" />
          </div>
          {computedAmount !== null && (
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-sm font-semibold text-success">Total: £{computedAmount.toFixed(2)}</p>
            </div>
          )}
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Weekend shift at Joe's Cafe" rows={2} />
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setLogOpen(false)}>Cancel</Button>
            <Button fullWidth loading={logEarning.isPending} onClick={handleLog}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
