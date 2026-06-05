'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBusinessJobs, useUpdateJob } from '@/hooks/useJobs';
import { useAllBusinessApplications } from '@/hooks/useApplications';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/SkeletonCard';
import { formatRelativeDate, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/utils';
import type { JobStatus } from '@/types';

const STATUS_TABS: { value: JobStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'filled', label: 'Filled' },
  { value: 'expired', label: 'Expired' },
  { value: 'draft', label: 'Drafts' },
];

export default function BusinessJobsPage() {
  const { data: jobs, isLoading } = useBusinessJobs();
  const { data: allApplications } = useAllBusinessApplications();
  const updateJob = useUpdateJob();
  const [activeTab, setActiveTab] = useState<JobStatus | 'all'>('all');

  const filtered = jobs?.filter((j) => activeTab === 'all' || j.status === activeTab) ?? [];

  const getAppCount = (jobId: string) => allApplications?.filter((a) => a.job_id === jobId).length ?? 0;

  const togglePause = async (jobId: string, currentStatus: JobStatus) => {
    const newStatus = currentStatus === 'paused' ? 'active' : 'paused';
    await updateJob.mutateAsync({ jobId, updates: { status: newStatus } });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <Link href="/business/create">
          <Button>Post a job</Button>
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-gray-200 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.value ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.value !== 'all' && jobs && (
              <span className="ml-1.5 text-xs text-text-secondary">
                ({jobs.filter((j) => j.status === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={activeTab === 'all' ? "No jobs posted yet" : `No ${activeTab} jobs`}
          description={activeTab === 'all' ? "Post your first job to start finding great student workers." : "Try a different status filter."}
          action={activeTab === 'all' ? { label: 'Post a job', onClick: () => window.location.href = '/business/create' } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const appCount = getAppCount(job.id);
            return (
              <div key={job.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${JOB_STATUS_COLORS[job.status]}`}>
                        {JOB_STATUS_LABELS[job.status]}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {job.parish && `${job.parish} · `}
                      Posted {formatRelativeDate(job.created_at || (job as any).createdAt)}
                    </p>
                  </div>
                  {appCount > 0 && (
                    <Link href={`/business/applications?job=${job.id}`}>
                      <span className="flex-shrink-0 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-primary-dark transition-colors">
                        {appCount} applicant{appCount !== 1 ? 's' : ''}
                      </span>
                    </Link>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/business/applications?job=${job.id}`}>
                    <Button variant="secondary" size="sm">View applications</Button>
                  </Link>
                  <Link href={`/business/jobs/${job.id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                  {(job.status === 'active' || job.status === 'paused') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={updateJob.isPending}
                      onClick={() => togglePause(job.id, job.status)}
                    >
                      {job.status === 'paused' ? 'Activate' : 'Pause'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
