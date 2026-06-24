'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useJob } from '@/hooks/useJobs';
import { useHasApplied } from '@/hooks/useApplications';
import { useAuthStore } from '@/stores/authStore';
import { useReadinessScore } from '@/hooks/useReadinessScore';
import { ApplyModal } from '@/components/student/ApplyModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/SkeletonCard';
import { formatPay, formatHours, formatAbsoluteDate, formatRelativeDate } from '@/lib/utils';
import { JOB_TYPE_LABELS } from '@/lib/constants';
import { useToggleSaveJob, useSavedJobs } from '@/hooks/useJobs';
import { useIsBlocked, useBlockUser } from '@/hooks/useBlocking';
import { useToast } from '@/components/providers/ToastProvider';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id);
  const { studentProfile } = useAuthStore();
  const completedContent = (studentProfile as any)?.work_ready_completed ?? [];
  const readiness = useReadinessScore(studentProfile, completedContent);
  const hasApplied = useHasApplied(id);
  const { data: savedJobs } = useSavedJobs();
  const toggleSave = useToggleSaveJob();
  const [applyOpen, setApplyOpen] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const isBusinessBlocked = useIsBlocked(job?.business_id);
  const blockUser = useBlockUser();
  const { showSuccess, showError } = useToast();

  const isSaved = savedJobs?.some((s) => s.job_id === id) ?? false;
  const isWorkReady = readiness.level === 'work_ready';

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-500">Job not found.</p>
        <Link href="/student" className="text-primary text-sm mt-2 hover:underline">Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link href="/student" className="text-sm text-primary hover:underline flex items-center gap-1 mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to jobs
      </Link>

      {/* Business header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar src={job.business?.logo_url} name={job.business?.business_name} size="lg" />
        <div>
          <p className="text-sm text-text-secondary">{job.business?.business_name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{job.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="primary">{JOB_TYPE_LABELS[job.job_type]}</Badge>
            {job.parish && <span className="text-sm text-text-secondary">📍 {job.parish}</span>}
          </div>
        </div>
      </div>

      {/* Key details */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wide">Pay</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPay(job)}</p>
        </div>
        {(job.hours_per_week_min || job.hours_per_week_max || job.is_hours_negotiable) && (
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide">Hours</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatHours(job)}</p>
          </div>
        )}
        {job.minimum_age > 16 && (
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide">Minimum age</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{job.minimum_age}+</p>
          </div>
        )}
        {job.application_deadline && (
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide">Deadline</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatAbsoluteDate(job.application_deadline)}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">About this role</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
      </div>

      {/* Required skills */}
      {job.required_skills?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Skills required</h2>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill) => <Badge key={skill} variant="default">{skill}</Badge>)}
          </div>
        </div>
      )}

      {/* Shift info */}
      {(job.shift_pattern || job.allows_split_shifts) && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Shift pattern</h2>
          {job.shift_pattern && <p className="text-sm text-gray-700">{job.shift_pattern}</p>}
          {job.allows_split_shifts && <p className="text-xs text-text-secondary mt-1">Split shifts available</p>}
        </div>
      )}

      {/* Business section */}
      {job.business && (
        <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Avatar src={job.business.logo_url} name={job.business.business_name} size="sm" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{job.business.business_name}</p>
              {job.business.is_verified && (
                <span className="text-xs text-success flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </span>
              )}
            </div>
          </div>
          {job.business.description && <p className="text-sm text-gray-600">{job.business.description}</p>}
          {!isBusinessBlocked && (
            <button
              onClick={() => setShowBlockConfirm(true)}
              className="mt-3 text-xs text-gray-400 hover:text-error"
            >
              🚫 Block this business
            </button>
          )}
        </div>
      )}

      {/* Sticky action bar */}
      <div className="sticky bottom-4 flex gap-3">
        <Button
          variant="secondary"
          onClick={() => toggleSave.mutate({ jobId: job.id, isSaved })}
          className="flex-shrink-0"
        >
          {isSaved ? '★ Saved' : '☆ Save'}
        </Button>

        {hasApplied ? (
          <Button fullWidth disabled variant="ghost">Applied ✓</Button>
        ) : !isWorkReady ? (
          <div className="flex-1 relative group">
            <Button fullWidth disabled>Apply now</Button>
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
              Complete Work Ready to unlock applications
            </div>
          </div>
        ) : (
          <Button fullWidth onClick={() => setApplyOpen(true)}>Apply now</Button>
        )}
      </div>

      {job && <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />}

      <Modal open={showBlockConfirm} onClose={() => setShowBlockConfirm(false)} title="Block this business?">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Their jobs will be hidden from your feed and they won&apos;t be able to message you.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowBlockConfirm(false)}>Cancel</Button>
            <Button
              variant="danger"
              fullWidth
              loading={blockUser.isPending}
              onClick={async () => {
                if (!job?.business_id) return;
                try {
                  await blockUser.mutateAsync(job.business_id);
                  showSuccess('Business blocked. Their jobs are now hidden from your feed.');
                  setShowBlockConfirm(false);
                } catch {
                  showError('Failed to block business. Please try again.');
                }
              }}
            >
              Block
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
