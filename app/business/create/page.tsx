'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateJob } from '@/hooks/useJobs';
import { useToast } from '@/components/providers/ToastProvider';
import { JobForm } from '@/components/business/JobForm';
import type { CreateJobForm } from '@/types';

export default function CreateJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState<Partial<CreateJobForm> & { status?: string }>({
    title: '', description: '', job_type: 'part_time',
    is_pay_negotiable: false, is_hours_negotiable: false,
    is_remote: false, allows_split_shifts: false, minimum_age: 16,
    required_skills: [], location: '', status: 'active',
  });

  const handleSubmit = async (status: 'active' | 'draft') => {
    if (!form.title?.trim()) { showError('Job title is required'); return; }
    if (!form.description?.trim()) { showError('Job description is required'); return; }
    if (!form.job_type) { showError('Job type is required'); return; }
    if (!form.location?.trim()) { showError('Location is required'); return; }

    try {
      await createJob.mutateAsync({ ...(form as CreateJobForm), status });
      showSuccess(status === 'draft' ? 'Job saved as draft.' : 'Job posted! Students will start seeing it now.');
      router.replace('/business');
    } catch {
      showError('Could not post the job. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/business" className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          My Jobs
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a job</h1>
      <JobForm
        value={form}
        onChange={setForm}
        onSaveDraft={() => handleSubmit('draft')}
        onPublish={() => handleSubmit('active')}
        loading={createJob.isPending}
      />
    </div>
  );
}
