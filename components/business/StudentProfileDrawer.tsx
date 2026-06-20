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
  const { showSuccess, showError } = useToast();

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

        {/* Leave a review — only once hired */}
        {isHired && (
          <Button fullWidth variant="secondary" onClick={() => setShowReviewModal(true)}>
            Leave a review
          </Button>
        )}
      </div>

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
