'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useApplyToJob } from '@/hooks/useApplications';
import { useTemplates } from '@/hooks/useProfile';
import { useToast } from '@/components/providers/ToastProvider';
import type { Job } from '@/types';

interface ApplyModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

export function ApplyModal({ job, open, onClose }: ApplyModalProps) {
  const [coverMessage, setCoverMessage] = useState('');
  const applyMutation = useApplyToJob();
  const { data: templates } = useTemplates();
  const { showSuccess, showError } = useToast();

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({ jobId: job.id, coverMessage: coverMessage || undefined });
      showSuccess('Application sent! Good luck.');
      onClose();
    } catch (err: any) {
      showError(err.message || 'Could not submit application. Please try again.');
    }
  };

  const applyTemplate = (msg: string) => setCoverMessage(msg);

  return (
    <Modal open={open} onClose={onClose} title={`Apply to ${job.title}`}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-text-secondary mb-1">{job.business?.business_name}</p>
          <p className="text-sm text-gray-600">
            Your profile will be shared with the employer. Add an optional cover message below.
          </p>
        </div>

        {templates && templates.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Load a template</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {(templates as any[]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.message)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-300 hover:border-primary text-gray-600 hover:text-primary transition-colors"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Textarea
          label="Cover message (optional)"
          value={coverMessage}
          onChange={(e) => setCoverMessage(e.target.value)}
          placeholder="Introduce yourself and explain why you'd be a great fit..."
          rows={4}
          showCount
          maxLength={500}
        />

        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={applyMutation.isPending} onClick={handleApply}>
            Send application
          </Button>
        </div>
      </div>
    </Modal>
  );
}
