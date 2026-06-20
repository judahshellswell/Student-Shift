'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  db,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
} from '@/lib/firebase';
import type { Review, CreateReviewForm, Business, Job } from '@/types';
import { useAuthStore } from '@/stores/authStore';

// Fetch reviews for a student
export function useStudentReviews(studentId: string | undefined) {
  return useQuery({
    queryKey: ['studentReviews', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');

      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, where('student_id', '==', studentId));
      const reviewsSnap = await getDocs(reviewsQuery);

      const reviews: Review[] = [];

      for (const docSnap of reviewsSnap.docs) {
        const reviewData = { id: docSnap.id, ...docSnap.data() } as Review;

        if (reviewData.business_id) {
          const businessSnap = await getDoc(doc(db, 'businesses', reviewData.business_id));
          if (businessSnap.exists()) {
            reviewData.business = { id: businessSnap.id, ...businessSnap.data() } as Business;
          }
        }

        if (reviewData.job_id) {
          const jobSnap = await getDoc(doc(db, 'jobs', reviewData.job_id));
          if (jobSnap.exists()) {
            reviewData.job = { id: jobSnap.id, ...jobSnap.data() } as Job;
          }
        }

        reviews.push(reviewData);
      }

      return reviews.sort((a, b) => {
        const aTime = (a.created_at as any)?.seconds ?? 0;
        const bTime = (b.created_at as any)?.seconds ?? 0;
        return bTime - aTime;
      });
    },
    enabled: !!studentId,
  });
}

// Calculate average ratings from reviews
export function useStudentRatings(studentId: string | undefined) {
  const { data: reviews } = useStudentReviews(studentId);

  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      reliabilityRating: 0,
      communicationRating: 0,
      workQualityRating: 0,
      totalReviews: 0,
      endorsedSkills: [] as { skill: string; count: number }[],
    };
  }

  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const reliabilityRating = reviews.reduce((sum, r) => sum + r.reliability_rating, 0) / totalReviews;
  const communicationRating = reviews.reduce((sum, r) => sum + r.communication_rating, 0) / totalReviews;
  const workQualityRating = reviews.reduce((sum, r) => sum + r.work_quality_rating, 0) / totalReviews;

  const skillCounts: Record<string, number> = {};
  reviews.forEach((review) => {
    review.endorsed_skills?.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  const endorsedSkills = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    reliabilityRating: Math.round(reliabilityRating * 10) / 10,
    communicationRating: Math.round(communicationRating * 10) / 10,
    workQualityRating: Math.round(workQualityRating * 10) / 10,
    totalReviews,
    endorsedSkills,
  };
}

// Create a new review (for businesses)
export function useCreateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewForm) => {
      if (!user) throw new Error('Not authenticated');

      const reviewsRef = collection(db, 'reviews');
      const newReview: Record<string, any> = {
        student_id: reviewData.student_id,
        business_id: user.uid,
        rating: reviewData.rating,
        reliability_rating: reviewData.reliability_rating,
        communication_rating: reviewData.communication_rating,
        work_quality_rating: reviewData.work_quality_rating,
        endorsed_skills: reviewData.endorsed_skills || [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      if (reviewData.job_id) newReview.job_id = reviewData.job_id;
      if (reviewData.comment) newReview.comment = reviewData.comment;

      const docRef = await addDoc(reviewsRef, newReview);
      return { id: docRef.id, ...newReview } as Record<string, any>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentReviews', data.student_id] });
    },
  });
}
