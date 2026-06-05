'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStudentApplications, useWithdrawApplication } from '@/hooks/useApplications';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/SkeletonCard';
import { useToast } from '@/components/providers/ToastProvider';
import { formatRelativeDate, APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';

const STATUS_TABS: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Not selected' },
];

export default function StudentApplicationsPage() {
  const { data: applications, isLoading } = useStudentApplications();
  const withdrawMutation = useWithdrawApplication();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = applications?.filter((a) => activeTab === 'all' || a.status === activeTab) ?? [];

  const handleWithdraw = async (id: string) => {
    try {
      await withdrawMutation.mutateAsync(id);
      showSuccess('Application withdrawn.');
    } catch {
      showError('Could not withdraw application.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">My Applications</h1>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-6 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.value ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.value !== 'all' && applications && (
              <span className="ml-1.5 text-xs text-text-secondary">
                ({applications.filter((a) => a.status === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={activeTab === 'all' ? "No applications yet" : `No ${APPLICATION_STATUS_LABELS[activeTab as ApplicationStatus]?.toLowerCase()} applications`}
          description={activeTab === 'all' ? "When you apply for jobs, they'll appear here." : "Try another status filter."}
          action={activeTab === 'all' ? { label: 'Browse jobs', onClick: () => window.location.href = '/student' } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div
                className="p-4 cursor-pointer flex items-center gap-3"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <Avatar src={app.job?.business?.logo_url} name={app.job?.business?.business_name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{app.job?.title || 'Unknown job'}</p>
                  <p className="text-xs text-text-secondary">{app.job?.business?.business_name} · Applied {formatRelativeDate(app.created_at || (app as any).createdAt)}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}>
                  {APPLICATION_STATUS_LABELS[app.status]}
                </span>
                <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expandedId === app.id && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                  {app.cover_message && (
                    <div>
                      <p className="text-xs font-medium text-text-secondary mb-1">Your cover message</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.cover_message}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {app.job && (
                      <Link href={`/student/jobs/${app.job_id}`}>
                        <Button variant="ghost" size="sm">View job</Button>
                      </Link>
                    )}
                    {(app.status === 'pending' || app.status === 'reviewed') && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={withdrawMutation.isPending}
                        onClick={() => handleWithdraw(app.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
