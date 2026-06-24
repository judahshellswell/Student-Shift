'use client';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { JOB_TYPES, COMMON_SKILLS, REGIONS, getParishOptionsForRegion } from '@/lib/constants';
import type { CreateJobForm } from '@/types';

interface JobFormProps {
  value: Partial<CreateJobForm> & { status?: string };
  onChange: (updates: Partial<CreateJobForm & { status?: string }>) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

export function JobForm({ value, onChange, onSaveDraft, onPublish, loading, isEdit }: JobFormProps) {
  const set = (updates: Partial<typeof value>) => onChange({ ...value, ...updates });

  const parishOptions = getParishOptionsForRegion(value.region || null);
  const toggleSkill = (skill: string) => {
    const skills = value.required_skills || [];
    set({ required_skills: skills.includes(skill) ? skills.filter((s) => s !== skill) : [...skills, skill] });
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Basic Information</h2>
        <div className="space-y-4">
          <Input label="Job title *" value={value.title || ''} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Barista, Retail Assistant, Labourer" />
          <Select
            label="Job type *"
            value={value.job_type || ''}
            onChange={(e) => set({ job_type: e.target.value as any })}
            options={JOB_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            placeholder="Select job type..."
          />
          <Textarea label="Job description *" value={value.description || ''} onChange={(e) => set({ description: e.target.value })} rows={5} placeholder="Describe the role, responsibilities, and what you're looking for..." />
        </div>
      </section>

      {/* Pay */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Pay</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={value.is_pay_negotiable || false} onChange={(e) => set({ is_pay_negotiable: e.target.checked })} className="rounded" />
            Pay is negotiable
          </label>
          {!value.is_pay_negotiable && (
            <Input
              label="Pay rate (£/hr)"
              type="number"
              min={0}
              step={0.01}
              value={value.hourly_rate_min || ''}
              onChange={(e) => {
                const rate = parseFloat(e.target.value) || undefined;
                set({ hourly_rate_min: rate, hourly_rate_max: rate });
              }}
              placeholder="9.50"
            />
          )}
          <Input label="Pay description (optional)" value={value.pay_description || ''} onChange={(e) => set({ pay_description: e.target.value })} placeholder="e.g. Depends on experience" />
        </div>
      </section>

      {/* Location */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Location</h2>
        <div className="space-y-3">
          <Select
            label="Region"
            value={value.region || ''}
            onChange={(e) => set({ region: e.target.value, parish: undefined })}
            options={REGIONS.map((r) => ({ value: r, label: r }))}
            placeholder="Select region..."
          />
          {parishOptions.length > 0 && (
            <Select
              label="Parish / area"
              value={value.parish || ''}
              onChange={(e) => set({ parish: e.target.value })}
              options={parishOptions.map((p) => ({ value: p, label: p }))}
              placeholder="Select area..."
            />
          )}
          <Input label="Location / address" value={value.location || ''} onChange={(e) => set({ location: e.target.value })} placeholder="e.g. St Helier town centre" />
          {value.region === 'UK' && (
            <Input label="Postcode" value={value.postcode || ''} onChange={(e) => set({ postcode: e.target.value })} placeholder="e.g. SW1A 1AA" />
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={value.is_remote || false} onChange={(e) => set({ is_remote: e.target.checked })} className="rounded" />
            Remote / work from home
          </label>
        </div>
      </section>

      {/* Hours */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Hours</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={value.is_hours_negotiable || false} onChange={(e) => set({ is_hours_negotiable: e.target.checked })} className="rounded" />
            Hours are negotiable
          </label>
          {!value.is_hours_negotiable && (
            <Input
              label="Hours per week"
              type="number"
              min={0}
              value={value.hours_per_week_min || ''}
              onChange={(e) => {
                const hours = parseFloat(e.target.value) || undefined;
                set({ hours_per_week_min: hours, hours_per_week_max: hours });
              }}
            />
          )}
          <Textarea label="Shift pattern (optional)" value={value.shift_pattern || ''} onChange={(e) => set({ shift_pattern: e.target.value })} rows={2} placeholder="e.g. Weekends and some weekday evenings" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={value.allows_split_shifts || false} onChange={(e) => set({ allows_split_shifts: e.target.checked })} className="rounded" />
            Split shifts available
          </label>
        </div>
      </section>

      {/* Requirements */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Requirements</h2>
        <div className="space-y-3">
          <Input
            label="Minimum age"
            type="number"
            min={16}
            max={24}
            value={value.minimum_age || 16}
            onChange={(e) => set({ minimum_age: parseInt(e.target.value) || 16 })}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Required skills (optional)</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    value.required_skills?.includes(skill)
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-secondary'
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dates */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Dates (optional)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Start date" type="date" value={value.start_date || ''} onChange={(e) => set({ start_date: e.target.value || undefined })} />
          <Input label="End date" type="date" value={value.end_date || ''} onChange={(e) => set({ end_date: e.target.value || undefined })} />
          <Input label="Application deadline" type="date" value={value.application_deadline || ''} onChange={(e) => set({ application_deadline: e.target.value || undefined })} />
        </div>
      </section>

      {/* Sticky submit bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 flex gap-3">
        <Button variant="ghost" loading={loading} onClick={onSaveDraft}>Save as draft</Button>
        <Button fullWidth loading={loading} onClick={onPublish}>{isEdit ? 'Save changes' : 'Post job'}</Button>
      </div>
    </div>
  );
}
