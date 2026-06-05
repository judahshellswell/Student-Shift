import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import type { Business, Job, JobStatus, ApplicationStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Handle Firestore Timestamp objects or ISO strings
export function toDateString(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'object' && value !== null && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return String(value);
}

export function toDate(value: unknown): Date | null {
  const str = toDateString(value);
  if (!str) return null;
  const d = parseISO(str);
  return isValid(d) ? d : null;
}

export function formatRelativeDate(value: unknown): string {
  const d = toDate(value);
  if (!d) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatAbsoluteDate(value: unknown): string {
  const d = toDate(value);
  if (!d) return '';
  return format(d, 'd MMM yyyy');
}

export function formatPay(job: Pick<Job, 'is_pay_negotiable' | 'hourly_rate_min' | 'hourly_rate_max' | 'pay_description'>): string {
  if (job.is_pay_negotiable) return 'Negotiable';
  if (job.pay_description) return job.pay_description;
  if (job.hourly_rate_min && job.hourly_rate_max) {
    return `£${job.hourly_rate_min.toFixed(2)}–£${job.hourly_rate_max.toFixed(2)}/hr`;
  }
  if (job.hourly_rate_min) return `£${job.hourly_rate_min.toFixed(2)}/hr`;
  if (job.hourly_rate_max) return `Up to £${job.hourly_rate_max.toFixed(2)}/hr`;
  return 'Not specified';
}

export function formatHours(job: Pick<Job, 'is_hours_negotiable' | 'hours_per_week_min' | 'hours_per_week_max'>): string {
  if (job.is_hours_negotiable) return 'Hours negotiable';
  if (job.hours_per_week_min && job.hours_per_week_max) {
    return `${job.hours_per_week_min}–${job.hours_per_week_max} hrs/wk`;
  }
  if (job.hours_per_week_min) return `${job.hours_per_week_min}+ hrs/wk`;
  if (job.hours_per_week_max) return `Up to ${job.hours_per_week_max} hrs/wk`;
  return '';
}

// Business profiles may have mixed camelCase/snake_case from Firestore
export function normalizeBusinessData(data: Record<string, unknown>): Partial<Business> {
  return {
    id: (data.id as string) || '',
    business_name: (data.business_name || data.businessName || '') as string,
    contact_name: (data.contact_name || data.contactName || '') as string,
    email: (data.email || data.contactEmail || null) as string | null,
    phone: (data.phone || null) as string | null,
    description: (data.description || null) as string | null,
    logo_url: (data.logo_url || data.logoUrl || null) as string | null,
    address: (data.address || null) as string | null,
    parish: (data.parish || null) as string | null,
    region: (data.region || null) as string | null,
    postcode: (data.postcode || null) as string | null,
    latitude: (data.latitude || null) as number | null,
    longitude: (data.longitude || null) as number | null,
    website: (data.website || null) as string | null,
    is_verified: Boolean(data.is_verified || data.isVerified),
    verification_tier: (data.verification_tier || data.verificationTier || 'unverified') as Business['verification_tier'],
    created_at: toDateString(data.created_at || data.createdAt),
  };
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  filled: 'Filled',
  expired: 'Expired',
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  filled: 'bg-blue-100 text-blue-700',
  expired: 'bg-red-100 text-red-700',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
  withdrawn: 'Withdrawn',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-green-100 text-green-700',
  withdrawn: 'bg-gray-100 text-gray-600',
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}
