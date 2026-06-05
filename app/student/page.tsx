'use client';

import { useState, useMemo } from 'react';
import { useJobs, type JobFilters } from '@/hooks/useJobs';
import { useAuthStore } from '@/stores/authStore';
import { useReadinessScore } from '@/hooks/useReadinessScore';
import { JobCard } from '@/components/student/JobCard';
import { JobCardSkeleton } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { getParishOptionsForRegion, JOB_TYPE_LABELS, JOB_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function StudentJobFeed() {
  const { studentProfile } = useAuthStore();
  const completedContent = (studentProfile as any)?.work_ready_completed ?? [];
  const readiness = useReadinessScore(studentProfile, completedContent);

  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedParishes, setSelectedParishes] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filters: JobFilters = {
    jobTypes: selectedTypes.length ? selectedTypes : undefined,
    parishes: selectedParishes.length ? selectedParishes : undefined,
  };

  const { data: jobs, isLoading, error } = useJobs(filters);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter((j) =>
      j.title?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q) ||
      j.business?.business_name?.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  const parishOptions = getParishOptionsForRegion(studentProfile?.region || null);
  const isWorkReady = readiness.level === 'work_ready';

  const toggleType = (type: string) => setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  const toggleParish = (parish: string) => setSelectedParishes((prev) => prev.includes(parish) ? prev.filter((p) => p !== parish) : [...prev, parish]);

  const visibleJobs = filteredJobs.slice(0, page * PAGE_SIZE);
  const hasMore = filteredJobs.length > page * PAGE_SIZE;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Work Ready banner */}
      {!isWorkReady && (
        <div className="mb-5 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
          <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Complete Work Ready to apply for jobs</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You&apos;re {readiness.score}% there. Complete your profile and Work Ready course to unlock applications.{' '}
              <a href="/student/workready" className="underline font-medium">Go to Work Ready →</a>
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-5">Jobs in {studentProfile?.region || 'your area'}</h1>

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
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {JOB_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => toggleType(value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              selectedTypes.includes(value)
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
            )}
          >
            {label}
          </button>
        ))}
        {parishOptions.map((parish) => (
          <button
            key={parish}
            onClick={() => toggleParish(parish)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              selectedParishes.includes(parish)
                ? 'bg-primary-bg text-primary border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
            )}
          >
            {parish}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-text-secondary mb-4">
          {filteredJobs.length === 0 ? 'No jobs found' : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`}
          {(selectedTypes.length > 0 || selectedParishes.length > 0 || search) && (
            <button
              onClick={() => { setSelectedTypes([]); setSelectedParishes([]); setSearch(''); }}
              className="ml-2 text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* Job grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <EmptyState title="Could not load jobs" description="Something went wrong. Please try refreshing the page." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your filters or check back later — new jobs are added regularly."
          action={{ label: 'Clear filters', onClick: () => { setSelectedTypes([]); setSelectedParishes([]); setSearch(''); } }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} showMatchScore={isWorkReady} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-bg transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
