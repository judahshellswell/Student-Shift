'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useJob, useUpdateJob } from '@/hooks/useJobs';
import { useToast } from '@/components/providers/ToastProvider';
import { JobForm } from '@/components/business/JobForm';
import type { CreateJobForm, Job } from '@/types';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: job, isLoading } = useJob(id);
  const updateJob = useUpdateJob();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState<Partial<CreateJobForm> & { status?: string }>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (job && !initialized) {
      setForm({
        title: job.title,
        description: job.description,
        job_type: job.job_type,
        hourly_rate_min: job.hourly_rate_min ?? undefined,
        hourly_rate_max: job.hourly_rate_max ?? undefined,
        is_pay_negotiable: job.is_pay_negotiable,
        pay_description: job.pay_description ?? undefined,
        location: job.location,
        parish: job.parish ?? undefined,
        region: job.region ?? undefined,
        postcode: job.postcode ?? undefined,
        is_remote: job.is_remote,
        hours_per_week_min: job.hours_per_week_min ?? undefined,
        hours_per_week_max: job.hours_per_week_max ?? undefined,
        is_hours_negotiable: job.is_hours_negotiable,
        shift_pattern: job.shift_pattern ?? undefined,
        allows_split_shifts: job.allows_split_shifts,
        minimum_age: job.minimum_age,
        required_skills: job.required_skills,
        start_date: job.start_date ?? undefined,
        end_date: job.end_date ?? undefined,
        application_deadline: job.application_deadline ?? undefined,
        status: job.status,
      });
      setInitialized(true);
    }
  }, [job, initialized]);

  const handleSubmit = async (status: string) => {
    if (!form.title?.trim()) { showError('Job title is required'); return; }
    try {
      await updateJob.mutateAsync({ jobId: id, updates: { ...form, status } as Partial<Job> });
      showSuccess('Job updated!');
      router.replace('/business');
    } catch {
      showError('Could not update the job.');
    }
  };

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-text-secondary">Loading…</div>;
  if (!job) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-text-secondary">Job not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/business" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        My Jobs
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit job</h1>

      {/* Quick status controls */}
      <div className="flex gap-2 mb-6">
        {job.status === 'active' && (
          <button onClick={() => handleSubmit('paused')} className="text-sm text-amber-600 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50">Pause job</button>
        )}
        {job.status === 'paused' && (
          <button onClick={() => handleSubmit('active')} className="text-sm text-success border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50">Activate job</button>
        )}
        {(job.status === 'active' || job.status === 'paused') && (
          <button onClick={() => handleSubmit('filled')} className="text-sm text-text-secondary border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">Mark as filled</button>
        )}
      </div>

      {initialized && (
        <JobForm
          value={form}
          onChange={setForm}
          onSaveDraft={() => handleSubmit('draft')}
          onPublish={() => handleSubmit(job.status === 'draft' ? 'active' : job.status)}
          loading={updateJob.isPending}
          isEdit
        />
      )}
    </div>
  );
}
