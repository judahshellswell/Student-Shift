import { useMemo } from 'react';
import type { Student } from '@/types';

export interface ReadinessItem {
  key: string;
  label: string;
  description: string;
  points: number;
  isComplete: boolean;
  category: 'profile' | 'verification' | 'preparation';
}

export interface ReadinessScore {
  score: number;
  level: 'starter' | 'developing' | 'ready' | 'work_ready';
  label: string;
  color: string;
  items: ReadinessItem[];
  completedPoints: number;
  totalPoints: number;
}

export const WORK_READY_CONTENT_KEYS = [
  'first_shift_tips', 'what_employers_expect', 'how_to_call_in', 'dress_code_basics',
  'interview_what_to_wear', 'interview_what_to_ask', 'interview_prep_tips',
  'research_the_business',
  'communication_skills', 'open_mindedness', 'workplace_attitude',
  'quiz_workplace_basics', 'quiz_interview_prep', 'quiz_research_skills', 'quiz_work_skills',
  'work_ethic_quiz',
] as const;

export type WorkReadyContentKey = typeof WORK_READY_CONTENT_KEYS[number];

export function computeReadinessScore(profile: Student | null, completedContent: string[] = []): ReadinessScore {
  if (!profile) {
    return { score: 0, level: 'starter', label: 'Starter', color: '#9CA3AF', items: [], completedPoints: 0, totalPoints: 100 };
  }

  const hasAvailability =
    profile.availability && Object.values(profile.availability).some((v) => v != null);

  const items: ReadinessItem[] = [
    { key: 'photo', label: 'Profile photo', description: 'Employers want to put a face to a name', points: 10, isComplete: !!profile.avatar_url, category: 'profile' },
    { key: 'bio', label: 'Written a bio', description: 'Tell employers a bit about yourself', points: 10, isComplete: !!(profile.bio && profile.bio.trim().length >= 5), category: 'profile' },
    { key: 'skills', label: 'Added skills', description: 'At least 3 skills listed', points: 10, isComplete: !!(profile.skills && profile.skills.length >= 3), category: 'profile' },
    { key: 'availability', label: 'Set availability', description: 'Employers need to know when you can work', points: 10, isComplete: !!hasAvailability, category: 'profile' },
    { key: 'cv', label: 'Uploaded a CV', description: 'Even a basic CV makes a big difference', points: 10, isComplete: !!profile.cv_url, category: 'profile' },
    { key: 'verified', label: 'School email verified', description: 'Proves you are who you say you are', points: 20, isComplete: !!profile.is_verified, category: 'verification' },
    { key: 'first_shift_tips', label: 'Read: First shift tips', description: 'Know what to expect on day one', points: 6, isComplete: completedContent.includes('first_shift_tips'), category: 'preparation' },
    { key: 'what_employers_expect', label: 'Read: What employers expect', description: 'Understand what good looks like', points: 6, isComplete: completedContent.includes('what_employers_expect'), category: 'preparation' },
    { key: 'how_to_call_in', label: 'Read: How to handle absence', description: 'Handle absence professionally', points: 6, isComplete: completedContent.includes('how_to_call_in'), category: 'preparation' },
    { key: 'dress_code_basics', label: 'Read: Dress code basics', description: 'First impressions count', points: 6, isComplete: completedContent.includes('dress_code_basics'), category: 'preparation' },
    { key: 'interview_what_to_wear', label: 'Read: What to wear to an interview', description: 'Dress to impress before you say a word', points: 6, isComplete: completedContent.includes('interview_what_to_wear'), category: 'preparation' },
    { key: 'interview_what_to_ask', label: 'Read: Questions to ask the employer', description: 'Show you are curious and prepared', points: 6, isComplete: completedContent.includes('interview_what_to_ask'), category: 'preparation' },
    { key: 'interview_prep_tips', label: 'Read: How to prepare for an interview', description: 'The preparation that separates candidates', points: 6, isComplete: completedContent.includes('interview_prep_tips'), category: 'preparation' },
    { key: 'research_the_business', label: 'Read: Researching a business', description: 'Know who you are applying to', points: 6, isComplete: completedContent.includes('research_the_business'), category: 'preparation' },
    { key: 'communication_skills', label: 'Read: Communication skills', description: 'Speak and listen like a professional', points: 6, isComplete: completedContent.includes('communication_skills'), category: 'preparation' },
    { key: 'open_mindedness', label: 'Read: Open-mindedness at work', description: 'Adapt, learn, and grow on the job', points: 6, isComplete: completedContent.includes('open_mindedness'), category: 'preparation' },
    { key: 'workplace_attitude', label: 'Read: Workplace attitude', description: 'The mindset that makes a great employee', points: 6, isComplete: completedContent.includes('workplace_attitude'), category: 'preparation' },
    { key: 'quiz_workplace_basics', label: 'Quiz: Workplace basics', description: 'Test your knowledge of day-one essentials', points: 6, isComplete: completedContent.includes('quiz_workplace_basics'), category: 'preparation' },
    { key: 'quiz_interview_prep', label: 'Quiz: Interview preparation', description: 'Prove you are ready to walk into any interview', points: 6, isComplete: completedContent.includes('quiz_interview_prep'), category: 'preparation' },
    { key: 'quiz_research_skills', label: 'Quiz: Research skills', description: 'Show you know how to find out about a business', points: 6, isComplete: completedContent.includes('quiz_research_skills'), category: 'preparation' },
    { key: 'quiz_work_skills', label: 'Quiz: Skills for work', description: 'Communication, attitude, and open-mindedness tested', points: 6, isComplete: completedContent.includes('quiz_work_skills'), category: 'preparation' },
    { key: 'work_ethic_quiz', label: 'Quiz: Final work readiness quiz', description: 'Everything covered — prove you are ready', points: 6, isComplete: completedContent.includes('work_ethic_quiz'), category: 'preparation' },
  ];

  const completedPoints = items.filter((i) => i.isComplete).reduce((sum, i) => sum + i.points, 0);
  const totalPoints = items.reduce((sum, i) => sum + i.points, 0);
  const score = Math.round((completedPoints / totalPoints) * 100);

  let level: ReadinessScore['level'];
  let label: string;
  let color: string;

  if (score < 30) { level = 'starter'; label = 'Starter'; color = '#9CA3AF'; }
  else if (score < 60) { level = 'developing'; label = 'Developing'; color = '#F59E0B'; }
  else if (score < 85) { level = 'ready'; label = 'Ready'; color = '#3B82F6'; }
  else { level = 'work_ready'; label = 'Work Ready'; color = '#10B981'; }

  return { score, level, label, color, items, completedPoints, totalPoints };
}

export function useReadinessScore(profile: Student | null, completedContent: string[] = []): ReadinessScore {
  return useMemo(() => computeReadinessScore(profile, completedContent), [profile, completedContent]);
}
