'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSavedJobs, useToggleSaveJob } from '@/hooks/useJobs';
import { useSavedSearches, useDeleteSavedSearch } from '@/hooks/useSavedSearches';
import { JobCard } from '@/components/student/JobCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/SkeletonCard';
import { useToast } from '@/components/providers/ToastProvider';
import { JOB_TYPE_LABELS } from '@/lib/constants';
import type { Job } from '@/types';

export default function SavedPage() {
  const [tab, setTab] = useState<'jobs' | 'searches'>('jobs');
  const { data: savedJobs, isLoading: loadingJobs } = useSavedJobs();
  const { data: savedSearches, isLoading: loadingSearches } = useSavedSearches();
  const toggleSave = useToggleSaveJob();
  const deleteSavedSearch = useDeleteSavedSearch();
  const { showSuccess } = useToast();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Saved</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {(['jobs', 'searches'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'jobs' ? 'Saved Jobs' : 'Saved Searches'}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        <>
          {loadingJobs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
            </div>
          ) : !savedJobs?.length ? (
            <EmptyState
              title="No saved jobs yet"
              description="Tap the bookmark icon on any job to save it for later."
              action={{ label: 'Browse jobs', onClick: () => window.location.href = '/student' }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedJobs.map((saved) => saved.job && <JobCard key={saved.job.id} job={saved.job as Job & { matchScore?: number }} />)}
            </div>
          )}
        </>
      )}

      {tab === 'searches' && (
        <>
          {loadingSearches ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : !savedSearches?.length ? (
            <EmptyState
              title="No saved searches"
              description="Save a search from the jobs feed to get notified when matching jobs appear."
            />
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <div key={search.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{search.name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {search.filters.jobTypes.map((t) => (
                          <Badge key={t} variant="primary">{JOB_TYPE_LABELS[t] || t}</Badge>
                        ))}
                        {search.filters.parishes.map((p) => (
                          <Badge key={p} variant="default">{p}</Badge>
                        ))}
                        {search.filters.searchQuery && (
                          <Badge variant="outline">&quot;{search.filters.searchQuery}&quot;</Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { deleteSavedSearch.mutate(search.id); showSuccess('Search deleted'); }}
                      className="text-gray-400 hover:text-error flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3">
                    <Link
                      href={`/student?jobTypes=${search.filters.jobTypes.join(',')}&parishes=${search.filters.parishes.join(',')}&searchQuery=${encodeURIComponent(search.filters.searchQuery || '')}`}
                    >
                      <Button variant="secondary" size="sm">Run search</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
