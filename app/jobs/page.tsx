'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useJobs } from '@/hooks/useJobs';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { JobCardSkeleton } from '@/components/ui/SkeletonCard';
import { AppLogo } from '@/components/layout/AppLogo';
import { formatPay, formatRelativeDate, cn } from '@/lib/utils';
import { JOB_TYPES, JOB_TYPE_LABELS } from '@/lib/constants';

const PAGE_SIZE = 20;

export default function PublicJobsPage() {
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: jobs, isLoading } = useJobs({ jobTypes: selectedTypes.length ? selectedTypes : undefined });

  const filtered = useMemo(() => {
    if (!jobs) return [];
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter((j) =>
      j.title?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q) ||
      j.business?.business_name?.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > page * PAGE_SIZE;

  const toggleType = (t: string) => setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <AppLogo />
          <div className="flex gap-2">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-1.5 rounded-lg">Sign in</Link>
            <Link href="/auth/welcome" className="text-sm font-medium bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">Sign up free</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse jobs</h1>
        <p className="text-text-secondary mb-6">Sign up to apply and see your match score.</p>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {JOB_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleType(value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                selectedTypes.includes(value) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No jobs found" description="Try adjusting your search or check back later." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((job) => (
                <div key={job.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <Avatar src={job.business?.logo_url} name={job.business?.business_name} size="md" className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary truncate">{job.business?.business_name}</p>
                      <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{job.title}</h3>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {job.parish && <p className="text-xs text-text-secondary">📍 {job.parish}</p>}
                    <p className="text-xs font-medium text-gray-700">{formatPay(job)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="primary">{JOB_TYPE_LABELS[job.job_type]}</Badge>
                    <span className="text-xs text-text-secondary ml-auto">{formatRelativeDate(job.created_at || (job as any).createdAt)}</span>
                  </div>
                  <Link
                    href="/auth/welcome"
                    className="mt-3 block w-full text-center text-xs font-medium text-primary border border-primary rounded-lg py-1.5 hover:bg-primary-bg transition-colors"
                  >
                    Sign up to apply
                  </Link>
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={() => setPage((p) => p + 1)} className="px-6 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-bg transition-colors">
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
