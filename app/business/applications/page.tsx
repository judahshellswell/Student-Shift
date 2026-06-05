'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAllBusinessApplications, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { useBusinessJobs } from '@/hooks/useJobs';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/SkeletonCard';
import { StudentProfileDrawer } from '@/components/business/StudentProfileDrawer';
import { useToast } from '@/components/providers/ToastProvider';
import { formatRelativeDate, APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from '@/lib/utils';
import type { Application, ApplicationStatus, Student } from '@/types';

const STATUS_OPTIONS: ApplicationStatus[] = ['pending', 'reviewed', 'shortlisted', 'hired', 'rejected'];

export default function BusinessApplicationsPage() {
  const searchParams = useSearchParams();
  const defaultJob = searchParams.get('job') || 'all';
  const { data: applications, isLoading } = useAllBusinessApplications();
  const { data: jobs } = useBusinessJobs();
  const updateStatus = useUpdateApplicationStatus();
  const { showSuccess, showError } = useToast();

  const [selectedJob, setSelectedJob] = useState(defaultJob);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = applications?.filter((a) => selectedJob === 'all' || a.job_id === selectedJob) ?? [];

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    try {
      await updateStatus.mutateAsync({ applicationId: appId, status });
      showSuccess(`Status updated to ${APPLICATION_STATUS_LABELS[status]}`);
    } catch { showError('Could not update status.'); }
  };

  const openStudentProfile = (app: Application) => {
    if (app.student) {
      setSelectedStudent(app.student);
      setDrawerOpen(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applications</h1>

      {/* Job filter */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-1">Filter by job</label>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All jobs ({applications?.length ?? 0} applications)</option>
          {jobs?.map((j) => {
            const count = applications?.filter((a) => a.job_id === j.id).length ?? 0;
            return <option key={j.id} value={j.id}>{j.title} ({count})</option>;
          })}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No applications yet" description="Applications will appear here as students apply for your jobs." />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <Avatar
                  src={app.student?.avatar_url}
                  name={app.student ? `${app.student.first_name} ${app.student.last_name}` : 'Student'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {app.student ? `${app.student.first_name} ${app.student.last_name}` : 'Student'}
                      </p>
                      {app.student?.school_or_college && (
                        <p className="text-xs text-text-secondary">{app.student.school_or_college}</p>
                      )}
                      <p className="text-xs text-text-secondary mt-0.5">
                        {app.job?.title} · Applied {formatRelativeDate(app.created_at || (app as any).createdAt)}
                      </p>
                    </div>
                    {/* Status dropdown */}
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${APPLICATION_STATUS_COLORS[app.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>

                  {app.cover_message && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{app.cover_message}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button variant="secondary" size="sm" onClick={() => openStudentProfile(app)}>View profile</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <StudentProfileDrawer student={selectedStudent} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
