'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { useApplyToJob } from '@/hooks/useApplications';
import { useApplicationTemplates, useBestTemplate, useCreateTemplate } from '@/hooks/useTemplates';
import { useToast } from '@/components/providers/ToastProvider';
import type { Job } from '@/types';

interface ApplyModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

export function ApplyModal({ job, open, onClose }: ApplyModalProps) {
  const [coverMessage, setCoverMessage] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const applyMutation = useApplyToJob();
  const { data: templates = [] } = useApplicationTemplates();
  const bestTemplate = useBestTemplate(job.job_type);
  const createTemplate = useCreateTemplate();
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

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) { showError('Please enter a template name.'); return; }
    try {
      await createTemplate.mutateAsync({
        name: templateName.trim(),
        job_type: job.job_type,
        message: coverMessage.trim(),
      });
      setShowSaveTemplate(false);
      setTemplateName('');
      showSuccess('Template saved for future applications.');
    } catch {
      showError('Failed to save template.');
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

        {templates.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Load a template</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.message)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-300 hover:border-primary text-gray-600 hover:text-primary transition-colors"
                >
                  {t.name}{t.is_default && ' ★'}
                </button>
              ))}
            </div>
          </div>
        )}

        {bestTemplate && !coverMessage && (
          <button
            onClick={() => applyTemplate(bestTemplate.message)}
            className="w-full text-left p-3 rounded-lg bg-primary-bg border border-primary/20 hover:border-primary transition-colors"
          >
            <p className="text-xs text-primary">Suggested template</p>
            <p className="text-sm font-semibold text-primary">{bestTemplate.name}</p>
          </button>
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

        {coverMessage.trim().length > 20 && !showSaveTemplate && (
          <button
            onClick={() => setShowSaveTemplate(true)}
            className="text-sm text-primary hover:underline"
          >
            Save this message as a template
          </button>
        )}

        {showSaveTemplate && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-3">
            <Input
              placeholder="Template name (e.g. Retail jobs)"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setShowSaveTemplate(false); setTemplateName(''); }}>Cancel</Button>
              <Button size="sm" loading={createTemplate.isPending} onClick={handleSaveTemplate}>Save</Button>
            </div>
          </div>
        )}

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
