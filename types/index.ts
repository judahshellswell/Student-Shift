// User types
export type UserType = 'student' | 'business';

export interface Profile {
  id: string;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

// Student types
export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  date_of_birth: string;
  school_or_college: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  cv_url: string | null;
  intro_video_url: string | null;
  availability: Availability;
  skills: string[];
  experience: Experience[];
  preferred_parishes: Parish[];
  region: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  search_radius_km: number | null;
  is_profile_complete: boolean;
  is_verified: boolean;
  account_status?: AccountStatus;
  requires_parental_consent?: boolean;
  parental_consent_status?: 'pending' | 'approved' | 'rejected' | 'revoked';
  parent_email?: string;
  parent_name?: string;
  push_token?: string | null;
  push_token_updated_at?: string | null;
  // Work Ready progress — stored as string[] on the Firestore doc
  work_ready_completed?: string[];
}

// Portfolio post types
export type PortfolioPostType =
  | 'work_experience'
  | 'volunteering'
  | 'education'
  | 'achievement'
  | 'project'
  | 'sports'
  | 'other';

export interface PortfolioPost {
  id: string;
  student_id: string;
  type: PortfolioPostType;
  title: string;
  organization: string | null;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  skills_used: string[];
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface DayHours {
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:00"
}

export interface Availability {
  monday?: DayHours | null;
  tuesday?: DayHours | null;
  wednesday?: DayHours | null;
  thursday?: DayHours | null;
  friday?: DayHours | null;
  saturday?: DayHours | null;
  sunday?: DayHours | null;
}

export type DayAvailability = 'morning' | 'afternoon' | 'evening' | 'all_day';

export interface Experience {
  id: string;
  title: string;
  company: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
}

export type AccountStatus = 'active' | 'suspended' | 'banned';

export type BusinessVerificationTier = 'unverified' | 'basic' | 'standard' | 'enhanced';

export interface Business {
  id: string;
  business_name: string;
  contact_name: string;
  phone: string | null;
  email: string | null;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  parish: Parish | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  region?: string | null;
  is_verified: boolean;
  verification_tier?: BusinessVerificationTier;
  verification_status?: 'pending_approval' | 'pending' | 'approved' | 'verified' | 'rejected';
  verification_id?: string;
  account_status?: AccountStatus;
  suspension_reason?: string | null;
  business_type?: 'limited_company' | 'partnership' | 'sole_trader' | 'charity' | 'other';
  jurisdiction?: 'uk' | 'jersey' | 'guernsey' | 'isle_of_man';
  company_number?: string | null;
  company_name_official?: string | null;
  created_at: string;
  push_token?: string | null;
  push_token_updated_at?: string | null;
}

export type Parish = string;

export type JobType = 'part_time' | 'temporary' | 'seasonal' | 'one_off' | 'zero_hours';
export type JobStatus = 'draft' | 'active' | 'paused' | 'filled' | 'expired';

export interface Job {
  id: string;
  business_id: string;
  title: string;
  description: string;
  description_document_url: string | null;
  job_type: JobType;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  is_pay_negotiable: boolean;
  pay_description: string | null;
  location: string;
  parish: Parish | null;
  region: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  is_remote: boolean;
  hours_per_week_min: number | null;
  hours_per_week_max: number | null;
  is_hours_negotiable: boolean;
  shift_pattern: string | null;
  allows_split_shifts: boolean;
  minimum_age: number;
  required_skills: string[];
  status: JobStatus;
  start_date: string | null;
  end_date: string | null;
  application_deadline: string | null;
  created_at: string;
  updated_at: string;
  business?: Business;
}

export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'rejected'
  | 'hired'
  | 'withdrawn';

export interface Application {
  id: string;
  job_id: string;
  student_id: string;
  status: ApplicationStatus;
  cover_message: string | null;
  created_at: string;
  updated_at: string;
  job?: Job;
  student?: Student;
}

export interface Conversation {
  id: string;
  student_id: string;
  business_id: string;
  job_id: string | null;
  created_at: string;
  updated_at: string;
  student?: Student;
  business?: Business;
  job?: Job;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface SavedJob {
  student_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
}

export interface CreateStudentForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  school_or_college?: string;
  phone?: string;
}

export interface CreateBusinessForm {
  business_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  description?: string;
  parish?: Parish;
}

export interface CreateJobForm {
  title: string;
  description: string;
  job_type: JobType;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  is_pay_negotiable?: boolean;
  pay_description?: string;
  location: string;
  parish?: Parish;
  region?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  is_remote?: boolean;
  hours_per_week_min?: number;
  hours_per_week_max?: number;
  is_hours_negotiable?: boolean;
  shift_pattern?: string;
  allows_split_shifts?: boolean;
  minimum_age?: number;
  required_skills?: string[];
  start_date?: string;
  end_date?: string;
  application_deadline?: string;
  description_document_url?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface Review {
  id: string;
  student_id: string;
  business_id: string;
  job_id: string | null;
  rating: number;
  reliability_rating: number;
  communication_rating: number;
  work_quality_rating: number;
  comment: string | null;
  endorsed_skills: string[];
  created_at: string;
  updated_at: string;
  business?: Business;
  job?: Job;
}

export interface CreateReviewForm {
  student_id: string;
  job_id?: string;
  rating: number;
  reliability_rating: number;
  communication_rating: number;
  work_quality_rating: number;
  comment?: string;
  endorsed_skills?: string[];
}

export interface ApplicationTemplate {
  id: string;
  student_id: string;
  name: string;
  job_type: JobType | null;
  message: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateForm {
  name: string;
  job_type?: JobType;
  message: string;
  is_default?: boolean;
}

export interface Earning {
  id: string;
  student_id: string;
  job_id: string | null;
  business_id: string | null;
  amount: number;
  hours_worked: number;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  job?: Job;
  business?: Business;
}

export interface CreateEarningForm {
  job_id?: string;
  business_id?: string;
  amount: number;
  hours_worked: number;
  date: string;
  description?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  totalHours: number;
  averageHourlyRate: number;
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  earningsByMonth: { month: string; amount: number }[];
}

export interface EarningsTemplate {
  id: string;
  student_id: string;
  name: string;
  amount: number;
  hours_worked: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEarningsTemplateForm {
  name: string;
  amount: number;
  hours_worked: number;
  description?: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'pending_approval' | 'verified' | 'rejected';

export interface VerificationRequest {
  id: string;
  user_id: string;
  user_type: UserType;
  status: VerificationStatus;
  school_email?: string;
  registration_number?: string;
  reviewed_by?: string;
  review_note?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedSearch {
  id: string;
  student_id: string;
  name: string;
  filters: {
    jobTypes: JobType[];
    parishes: Parish[];
    searchQuery?: string;
  };
  notify_new_jobs: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSavedSearchForm {
  name: string;
  filters: {
    jobTypes: JobType[];
    parishes: Parish[];
    searchQuery?: string;
  };
  notify_new_jobs?: boolean;
}

export type ReportCategory =
  | 'inappropriate_content'
  | 'harassment'
  | 'grooming'
  | 'fake_business'
  | 'safety_concern'
  | 'underage'
  | 'other';

export type ReportStatus = 'new' | 'under_review' | 'action_taken' | 'dismissed';
export type ReportPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Report {
  id: string;
  reporter_id: string;
  reporter_type: 'student' | 'business' | 'parent' | 'anonymous';
  reported_id: string;
  reported_type: 'user' | 'message' | 'job' | 'review';
  category: ReportCategory;
  description: string;
  evidence_urls: string[];
  status: ReportStatus;
  priority: ReportPriority;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}
