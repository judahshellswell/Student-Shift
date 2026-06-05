'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Job } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeDate, formatPay, cn } from '@/lib/utils';
import { JOB_TYPE_LABELS } from '@/lib/constants';
import { useToggleSaveJob, useSavedJobs } from '@/hooks/useJobs';

interface JobCardProps {
  job: Job & { matchScore?: number };
  showMatchScore?: boolean;
}

export function JobCard({ job, showMatchScore = false }: JobCardProps) {
  const { data: savedJobs } = useSavedJobs();
  const toggleSave = useToggleSaveJob();
  const isSaved = savedJobs?.some((s) => s.job_id === job.id) ?? false;

  const businessName = job.business?.business_name || '';
  const logoUrl = job.business?.logo_url;

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate({ jobId: job.id, isSaved });
  };

  const matchScore = job.matchScore;
  const showScore = showMatchScore && matchScore !== undefined && matchScore >= 60;
  const scoreColor = matchScore && matchScore >= 80 ? 'bg-success text-white' : 'bg-primary text-white';

  return (
    <Link href={`/student/jobs/${job.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow relative">
        {/* Match score badge */}
        {showScore && (
          <div className={cn('absolute top-3 right-12 px-2 py-0.5 rounded-full text-xs font-semibold', scoreColor)}>
            {matchScore}% match
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSaveToggle}
          className="absolute top-3 right-3 text-gray-400 hover:text-secondary transition-colors"
          title={isSaved ? 'Unsave' : 'Save'}
        >
          <svg className={cn('w-5 h-5', isSaved && 'fill-secondary text-secondary')} fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* Business */}
        <div className="flex items-start gap-3 pr-16">
          <Avatar src={logoUrl} name={businessName} size="md" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary truncate">{businessName}</p>
            <h3 className="text-sm font-semibold text-gray-900 mt-0.5 leading-tight">{job.title}</h3>
          </div>
        </div>

        {/* Details */}
        <div className="mt-3 space-y-1.5">
          {job.parish && (
            <p className="text-xs text-text-secondary flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.parish}
            </p>
          )}
          <p className="text-xs font-medium text-gray-700">{formatPay(job)}</p>
        </div>

        {/* Tags */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="primary">{JOB_TYPE_LABELS[job.job_type] || job.job_type}</Badge>
          <span className="text-xs text-text-secondary ml-auto">{formatRelativeDate(job.created_at || (job as any).createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
