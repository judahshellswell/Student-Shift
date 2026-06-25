'use client';

import { useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { ReadinessScoreRing } from '@/components/ui/ReadinessScoreRing';
import { ReviewCard } from '@/components/student/ReviewCard';
import { computeReadinessScore } from '@/hooks/useReadinessScore';
import { useStudentReviews, useStudentRatings, useCreateReview } from '@/hooks/useReviews';
import { useIsBlocked, useBlockUser, useUnblockUser } from '@/hooks/useBlocking';
import { useToast } from '@/components/providers/ToastProvider';
import { DAYS_OF_WEEK, DAY_LABELS } from '@/lib/constants';
import type { Student, Availability, DayHours, ApplicationStatus } from '@/types';

interface StudentProfileDrawerProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
  applicationStatus?: ApplicationStatus;
  jobId?: string;
}

function StarPicker({ rating, onRate }: { rating: number; onRate: (n: number) => void }) {
  return (
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onRate(n)} className="text-2xl leading-none">
          <span className={n <= rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  );
}

export function StudentProfileDrawer({ student, open, onClose, applicationStatus, jobId }: StudentProfileDrawerProps) {
  const { data: reviews = [] } = useStudentReviews(student?.id);
  const ratings = useStudentRatings(student?.id);
  const createReview = useCreateReview();
  const isBlocked = useIsBlocked(student?.id);
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const { showSuccess, showError } = useToast();

  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewReliability, setReviewReliability] = useState(0);
  const [reviewCommunication, setReviewCommunication] = useState(0);
  const [reviewWorkQuality, setReviewWorkQuality] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSkills, setReviewSkills] = useState<string[]>([]);

  if (!student) return null;

  const completedContent: string[] = (student as any)?.work_ready_completed ?? [];
  const readiness = computeReadinessScore(student, completedContent);
  const name = `${student.first_name} ${student.last_name}`;
  const isHired = applicationStatus === 'hired';

  const resetReviewForm = () => {
    setReviewRating(0);
    setReviewReliability(0);
    setReviewCommunication(0);
    setReviewWorkQuality(0);
    setReviewComment('');
    setReviewSkills([]);
  };

  const handleToggleBlock = async () => {
    try {
      if (isBlocked) {
        await unblockUser.mutateAsync(student.id);
        showSuccess(`${student.first_name} has been unblocked.`);
      } else {
        await blockUser.mutateAsync(student.id);
        showSuccess(`${student.first_name} has been blocked.`);
        setShowBlockConfirm(false);
      }
    } catch {
      showError('Failed to update block status. Please try again.');
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0 || reviewReliability === 0 || reviewCommunication === 0 || reviewWorkQuality === 0) {
      showError('Please set all four star ratings before submitting.');
      return;
    }
    try {
      await createReview.mutateAsync({
        student_id: student.id,
        job_id: jobId,
        rating: reviewRating,
        reliability_rating: reviewReliability,
        communication_rating: reviewCommunication,
        work_quality_rating: reviewWorkQuality,
        comment: reviewComment.trim() || undefined,
        endorsed_skills: reviewSkills,
      });
      setShowReviewModal(false);
      resetReviewForm();
      showSuccess(`Your review for ${student.first_name} has been posted to their profile.`);
    } catch {
      showError('Failed to submit review. Please try again.');
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Applicant profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar src={student.avatar_url} name={name} size="xl" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
              {student.school_or_college && <p className="text-sm text-text-secondary">{student.school_or_college}</p>}
              <div className="mt-2">
                <ReadinessScoreRing score={readiness.score} color={readiness.color} label={readiness.label} size={56} strokeWidth={5} />
              </div>
            </div>
          </div>
          <button
            onClick={() => isBlocked ? handleToggleBlock() : setShowBlockConfirm(true)}
            disabled={unblockUser.isPending}
            className="flex-shrink-0 text-xs text-gray-400 hover:text-error disabled:opacity-50 flex items-center gap-1.5"
            title={isBlocked ? 'Unblock this student' : 'Block this student'}
          >
            {unblockUser.isPending && (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>

        {isBlocked && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-text-secondary">
            You have blocked this student. They cannot apply to your jobs or message you.
          </div>
        )}

        {/* Contact details — only once hired */}
        {isHired && (
          <div className="rounded-lg border-l-4 border-success bg-green-50 p-4">
            <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1.5">🎉 Hired — contact details</h3>
            <div className="space-y-1 text-sm text-gray-800">
              {student.phone && <p>📞 {student.phone}</p>}
              {student.email && <p>✉️ {student.email}</p>}
              {!student.phone && !student.email && <p className="text-text-secondary">No contact details on file yet.</p>}
            </div>
          </div>
        )}

        {/* Bio */}
        {student.bio && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">About</h3>
            <p className="text-sm text-gray-700">{student.bio}</p>
          </div>
        )}

        {/* Skills */}
        {student.skills?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((s) => <Badge key={s} variant="default">{s}</Badge>)}
            </div>
          </div>
        )}

        {/* Availability */}
        {student.availability && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">Availability</h3>
            <div className="space-y-1">
              {DAYS_OF_WEEK.map((day) => {
                const dayData = student.availability[day as keyof Availability] as DayHours | null | undefined;
                if (!dayData) return null;
                return (
                  <div key={day} className="flex items-center gap-2 text-xs">
                    <span className="w-10 font-medium text-gray-700">{DAY_LABELS[day as keyof typeof DAY_LABELS]}</span>
                    <span className="text-text-secondary">{dayData.startTime} – {dayData.endTime}</span>
                  </div>
                );
              })}
              {Object.values(student.availability).every((v) => !v) && (
                <p className="text-xs text-text-secondary">No availability set</p>
              )}
            </div>
          </div>
        )}

        {/* CV */}
        {student.cv_url && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">CV</h3>
            <a href={student.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              Download CV →
            </a>
          </div>
        )}

        {/* Intro video */}
        {student.intro_video_url && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">Intro video</h3>
            <video src={student.intro_video_url} controls className="w-full rounded-lg max-h-48" />
          </div>
        )}

        {/* Reviews from other employers */}
        {reviews.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Reviews from employers</h3>
              <span className="text-xs text-text-secondary">★ {ratings.averageRating.toFixed(1)} ({ratings.totalReviews})</span>
            </div>
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        )}

        {/* Leave a review — only once hired, and not if blocked */}
        {isHired && !isBlocked && (
          <Button fullWidth variant="secondary" onClick={() => setShowReviewModal(true)}>
            Leave a review
          </Button>
        )}
      </div>

      {/* Block confirmation modal */}
      <Modal open={showBlockConfirm} onClose={() => setShowBlockConfirm(false)} title="Block this student?">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            They won&apos;t be able to apply to your jobs or message you.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowBlockConfirm(false)}>Cancel</Button>
            <Button variant="danger" fullWidth loading={blockUser.isPending} onClick={handleToggleBlock}>Block</Button>
          </div>
        </div>
      </Modal>

      {/* Leave review modal */}
      <Modal open={showReviewModal} onClose={() => setShowReviewModal(false)} title={`Review ${student.first_name}`} size="lg">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Overall rating</p>
            <StarPicker rating={reviewRating} onRate={setReviewRating} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Reliability</p>
            <StarPicker rating={reviewReliability} onRate={setReviewReliability} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Communication</p>
            <StarPicker rating={reviewCommunication} onRate={setReviewCommunication} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Work quality</p>
            <StarPicker rating={reviewWorkQuality} onRate={setReviewWorkQuality} />
          </div>

          <Textarea
            label="Comment (optional)"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            placeholder={`Tell ${student.first_name} what they did well or could improve...`}
          />

          {student.skills && student.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Endorse skills (tap to select)</p>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill) => {
                  const selected = reviewSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setReviewSkills((prev) => selected ? prev.filter((s) => s !== skill) : [...prev, skill])}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selected ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowReviewModal(false)}>Cancel</Button>
            <Button fullWidth loading={createReview.isPending} onClick={handleSubmitReview}>Submit</Button>
          </div>
        </div>
      </Modal>
    </Drawer>
  );
}
