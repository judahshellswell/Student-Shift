'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useReadinessScore } from '@/hooks/useReadinessScore';
import { useUpdateStudentProfile, useUploadAvatar, useUploadCV, useUploadIntroVideo, usePortfolioPosts, useAddPortfolioPost, useDeletePortfolioPost } from '@/hooks/useProfile';
import { useStudentReviews, useStudentRatings } from '@/hooks/useReviews';
import { useSubmitReport } from '@/hooks/useReporting';
import { useBlockedUsers, useUnblockUser } from '@/hooks/useBlocking';
import { useToast } from '@/components/providers/ToastProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ReadinessScoreRing } from '@/components/ui/ReadinessScoreRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ReviewCard } from '@/components/student/ReviewCard';
import { COMMON_SKILLS, DAYS_OF_WEEK, DAY_LABELS, getParishOptionsForRegion, REGIONS, PORTFOLIO_POST_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getVideoDuration } from '@/lib/firebase';
import type { Availability, DayHours, PortfolioPostType, Review } from '@/types';

export default function StudentProfilePage() {
  const { studentProfile, signOut } = useAuthStore();
  const completedContent = (studentProfile as any)?.work_ready_completed ?? [];
  const readiness = useReadinessScore(studentProfile, completedContent);

  const updateProfile = useUpdateStudentProfile();
  const uploadAvatar = useUploadAvatar();
  const uploadCV = useUploadCV();
  const uploadVideo = useUploadIntroVideo();
  const { data: portfolioPosts } = usePortfolioPosts();
  const addPost = useAddPortfolioPost();
  const deletePost = useDeletePortfolioPost();
  const { showSuccess, showError } = useToast();

  const { data: reviews = [] } = useStudentReviews(studentProfile?.id);
  const ratings = useStudentRatings(studentProfile?.id);
  const submitReport = useSubmitReport();
  const { data: blockedUsers = [] } = useBlockedUsers();
  const unblockUser = useUnblockUser();

  const [editBio, setEditBio] = useState(false);
  const [bio, setBio] = useState(studentProfile?.bio || '');
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [newPost, setNewPost] = useState({ type: 'work_experience' as PortfolioPostType, title: '', organization: '', description: '', start_date: '', end_date: '', is_current: false });
  const [disputeReview, setDisputeReview] = useState<Review | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const handleOpenDispute = (review: Review) => {
    setDisputeReview(review);
    setDisputeReason('');
  };

  const handleSubmitDispute = async () => {
    if (!disputeReview) return;
    if (!disputeReason.trim()) { showError('Please provide a reason for your dispute.'); return; }
    try {
      await submitReport.mutateAsync({
        reported_id: disputeReview.id,
        reported_type: 'review',
        category: 'other',
        description: `Review dispute: ${disputeReason.trim()}`,
      });
      setDisputeReview(null);
      setDisputeReason('');
      showSuccess('Your dispute has been sent for moderation.');
    } catch {
      showError('Failed to submit dispute. Please try again.');
    }
  };

  const name = studentProfile ? `${studentProfile.first_name} ${studentProfile.last_name}` : '';

  // ── Avatar upload ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      showSuccess('Profile photo updated!');
    } catch { showError('Could not upload photo.'); }
  };

  // ── CV upload ──
  const handleCVChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadCV.mutateAsync(file);
      showSuccess('CV updated!');
    } catch { showError('Could not upload CV.'); }
  };

  // ── Video upload ──
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dur = await getVideoDuration(file);
      if (dur > 60) { showError('Video must be 60 seconds or under.'); return; }
      await uploadVideo.mutateAsync(file);
      showSuccess('Intro video updated!');
    } catch { showError('Could not upload video.'); }
  };

  // ── Skills ──
  const toggleSkill = async (skill: string) => {
    if (!studentProfile) return;
    const skills = studentProfile.skills.includes(skill)
      ? studentProfile.skills.filter((s) => s !== skill)
      : [...studentProfile.skills, skill];
    await updateProfile.mutateAsync({ skills });
  };

  // ── Availability ──
  const toggleDay = async (day: string) => {
    if (!studentProfile) return;
    const current = studentProfile.availability[day as keyof Availability];
    const next = { ...studentProfile.availability };
    if (current) delete next[day as keyof Availability];
    else next[day as keyof Availability] = { startTime: '09:00', endTime: '17:00' };
    await updateProfile.mutateAsync({ availability: next });
  };

  const setDayTime = async (day: string, field: 'startTime' | 'endTime', value: string) => {
    if (!studentProfile) return;
    const current = (studentProfile.availability[day as keyof Availability] as DayHours) || { startTime: '09:00', endTime: '17:00' };
    const next = { ...studentProfile.availability, [day]: { ...current, [field]: value } };
    await updateProfile.mutateAsync({ availability: next });
  };

  const handleAddPortfolioPost = async () => {
    if (!newPost.title) { showError('Please enter a title'); return; }
    await addPost.mutateAsync({ ...newPost, skills_used: [], image_urls: [] });
    setPortfolioOpen(false);
    setNewPost({ type: 'work_experience', title: '', organization: '', description: '', start_date: '', end_date: '', is_current: false });
    showSuccess('Portfolio item added!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Header card */}
      <Card padding="lg">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar src={studentProfile?.avatar_url} name={name} size="xl" />
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">{name || 'Your name'}</h2>
            {studentProfile?.school_or_college && <p className="text-sm text-text-secondary">{studentProfile.school_or_college}</p>}
            <div className="mt-2">
              <ReadinessScoreRing score={readiness.score} color={readiness.color} label={readiness.label} size={60} strokeWidth={6} />
            </div>
          </div>
        </div>
      </Card>

      {/* Bio */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Bio</h3>
          <Button variant="ghost" size="sm" onClick={() => { setEditBio(!editBio); setBio(studentProfile?.bio || ''); }}>
            {editBio ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        {editBio ? (
          <div className="space-y-2">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} showCount maxLength={300} />
            <Button size="sm" loading={updateProfile.isPending} onClick={async () => { await updateProfile.mutateAsync({ bio }); setEditBio(false); showSuccess('Bio saved!'); }}>Save</Button>
          </div>
        ) : (
          <p className="text-sm text-gray-700">{studentProfile?.bio || <span className="text-text-secondary italic">No bio yet. Add one to earn +10 pts.</span>}</p>
        )}
      </Card>

      {/* Skills */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_SKILLS.map((skill) => {
            const selected = studentProfile?.skills?.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  selected ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                )}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Availability */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map((day) => {
            const dayData = studentProfile?.availability?.[day as keyof Availability] as DayHours | null | undefined;
            const enabled = !!dayData;
            return (
              <div key={day} className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'w-12 text-xs font-medium py-1 rounded-md border transition-colors',
                    enabled ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-300'
                  )}
                >
                  {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                </button>
                {enabled && (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={dayData?.startTime || '09:00'} onChange={(e) => setDayTime(day, 'startTime', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 flex-1" />
                    <span className="text-xs text-gray-400">to</span>
                    <input type="time" value={dayData?.endTime || '17:00'} onChange={(e) => setDayTime(day, 'endTime', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 flex-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* CV */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">CV</h3>
            {studentProfile?.cv_url ? (
              <a href={studentProfile.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View / Download CV</a>
            ) : (
              <p className="text-xs text-text-secondary">No CV uploaded yet. Upload one to earn +10 pts.</p>
            )}
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none rounded-lg text-sm px-4 py-2 border border-primary text-primary bg-white hover:bg-primary-bg cursor-pointer">
              {studentProfile?.cv_url ? 'Replace' : 'Upload CV'}
            </span>
            <input type="file" accept=".pdf,image/*" className="sr-only" onChange={handleCVChange} />
          </label>
        </div>
      </Card>

      {/* Intro video */}
      <Card padding="md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Intro video</h3>
            {studentProfile?.intro_video_url ? (
              <video src={studentProfile.intro_video_url} controls className="w-full rounded-lg max-h-40 mt-2" />
            ) : (
              <p className="text-xs text-text-secondary">No intro video yet. Max 60 seconds.</p>
            )}
          </div>
          <label className="cursor-pointer flex-shrink-0">
            <span className="inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-lg text-sm px-4 py-2 border border-primary text-primary bg-white hover:bg-primary-bg cursor-pointer">
              {studentProfile?.intro_video_url ? 'Replace' : 'Upload'}
            </span>
            <input type="file" accept="video/*" className="sr-only" onChange={handleVideoChange} />
          </label>
        </div>
      </Card>

      {/* Portfolio */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Portfolio</h3>
          <Button variant="secondary" size="sm" onClick={() => setPortfolioOpen(true)}>Add item</Button>
        </div>
        {!portfolioPosts?.length ? (
          <p className="text-xs text-text-secondary">Add work experience, volunteering, achievements, and more.</p>
        ) : (
          <div className="space-y-2">
            {portfolioPosts.map((post) => (
              <div key={post.id} className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{post.title}</p>
                  {post.organization && <p className="text-xs text-text-secondary">{post.organization}</p>}
                  <Badge variant="default" className="mt-1 capitalize">{post.type.replace('_', ' ')}</Badge>
                </div>
                <button onClick={() => deletePost.mutate(post.id)} className="text-gray-400 hover:text-error flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Reviews */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Reviews</h3>
          {ratings.totalReviews > 0 && (
            <span className="text-xs text-text-secondary">★ {ratings.averageRating.toFixed(1)} ({ratings.totalReviews})</span>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="text-xs text-text-secondary">Complete jobs to receive reviews from employers.</p>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onDispute={handleOpenDispute} />
            ))}
          </div>
        )}
      </Card>

      {/* Blocked businesses */}
      {blockedUsers.length > 0 && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Blocked businesses ({blockedUsers.length})</h3>
          <div className="space-y-2">
            {blockedUsers.map((blocked) => (
              <div key={blocked.id} className="flex items-center justify-between py-1.5">
                <p className="text-sm text-gray-700">{(blocked as any).blocked_name || blocked.blocked_id}</p>
                <button
                  onClick={async () => {
                    try {
                      await unblockUser.mutateAsync(blocked.blocked_id);
                      showSuccess('Business unblocked.');
                    } catch {
                      showError('Failed to unblock. Please try again.');
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sign out / danger zone */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Account</h3>
        <Button variant="ghost" fullWidth onClick={signOut}>Sign out</Button>
      </Card>

      {/* Portfolio modal */}
      <Modal open={portfolioOpen} onClose={() => setPortfolioOpen(false)} title="Add portfolio item">
        <div className="space-y-4">
          <Select
            label="Type"
            value={newPost.type}
            onChange={(e) => setNewPost({ ...newPost, type: e.target.value as PortfolioPostType })}
            options={PORTFOLIO_POST_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <Input label="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} placeholder="e.g. Barista at Joe's Café" />
          <Input label="Organisation (optional)" value={newPost.organization} onChange={(e) => setNewPost({ ...newPost, organization: e.target.value })} />
          <Textarea label="Description" value={newPost.description} onChange={(e) => setNewPost({ ...newPost, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="date" value={newPost.start_date} onChange={(e) => setNewPost({ ...newPost, start_date: e.target.value })} />
            {!newPost.is_current && (
              <Input label="End date" type="date" value={newPost.end_date} onChange={(e) => setNewPost({ ...newPost, end_date: e.target.value })} />
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={newPost.is_current} onChange={(e) => setNewPost({ ...newPost, is_current: e.target.checked })} className="rounded" />
            Still ongoing
          </label>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setPortfolioOpen(false)}>Cancel</Button>
            <Button fullWidth loading={addPost.isPending} onClick={handleAddPortfolioPost}>Add</Button>
          </div>
        </div>
      </Modal>

      {/* Dispute review modal */}
      <Modal open={!!disputeReview} onClose={() => setDisputeReview(null)} title="Dispute this review">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Tell us why you think this review is unfair or inaccurate. An admin will review your dispute and may remove the review if it violates our guidelines.
          </p>
          <Textarea
            label="Your reason"
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            rows={4}
            placeholder="Briefly explain why this review should be removed..."
          />
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setDisputeReview(null)}>Cancel</Button>
            <Button variant="danger" fullWidth loading={submitReport.isPending} onClick={handleSubmitDispute}>Submit dispute</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
