'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  db, collection, query, where, getDocs, getDoc, doc,
  addDoc, updateDoc, deleteDoc, serverTimestamp,
} from '@/lib/firebase';
import type { Job, CreateJobForm, Business, Student } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { normalizeBusinessData, toDateString } from '@/lib/utils';

export interface JobFilters {
  jobTypes?: string[];
  parishes?: string[];
  searchQuery?: string;
  radiusKm?: number;
}

function getRegionForParishLocal(parish: string): string | null {
  const jerseyParishes = ['Grouville','St. Brelade','St. Clement','St. Helier','St. John','St. Lawrence','St. Martin','St. Mary','St. Ouen','St. Peter','St. Saviour','Trinity'];
  const guernseyParishes = ['Castel','Forest','St Andrew','St Martin','St Peter Port','St Pierre du Bois','St Sampson','St Saviour','Torteval','Vale','Alderney','Sark'];
  const iomSheadings = ['Ayre','Garff','Glenfaba','Michael','Middle','Rushen'];
  const iomParishes = ['Andreas','Bride','Lezayre','Lonan','Maughold','German','Patrick','Ballaugh','Jurby','Michael','Braddan','Marown','Onchan','Santon','Douglas','Arbory','Malew','Rushen'];
  if (jerseyParishes.includes(parish)) return 'Jersey';
  if (guernseyParishes.includes(parish)) return 'Guernsey';
  if (iomSheadings.includes(parish) || iomParishes.includes(parish)) return 'Isle of Man';
  return null;
}

function calculateMatchScore(job: Job, student: Student): number {
  let score = 0;
  const maxScore = 100;

  // Location score (40 pts)
  const studentRegion = student.region;
  if (studentRegion && studentRegion !== 'UK') {
    const jobRegion = job.region || (job.parish ? getRegionForParishLocal(job.parish) : null);
    if (!jobRegion || jobRegion === studentRegion) {
      if (job.parish && student.preferred_parishes?.includes(job.parish)) score += 40;
      else if (!student.preferred_parishes?.length) score += 20;
      else score += 10;
    }
  } else if (studentRegion === 'UK') {
    score += 20; // simplified for UK
  } else {
    score += 20;
  }

  // Skills score (40 pts)
  if (job.required_skills?.length > 0 && student.skills?.length > 0) {
    const matched = job.required_skills.filter((s) => student.skills.includes(s)).length;
    score += Math.round((matched / job.required_skills.length) * 40);
  } else {
    score += 40;
  }

  // Availability score (20 pts)
  const hasAvailability = student.availability && Object.values(student.availability).some((v) => v != null);
  if (hasAvailability) score += 20;

  return Math.round((score / maxScore) * 100);
}

export function useJobs(filters?: JobFilters) {
  const { studentProfile } = useAuthStore();

  return useQuery({
    queryKey: ['jobs', filters, studentProfile?.region],
    queryFn: async () => {
      const q = query(collection(db, 'jobs'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const jobs: (Job & { matchScore?: number })[] = [];
      const studentRegion = studentProfile?.region || null;

      for (const docSnap of snapshot.docs) {
        const jobData = { id: docSnap.id, ...docSnap.data() } as Job;

        if (studentRegion) {
          const jobRegion = jobData.region || (jobData.parish ? getRegionForParishLocal(jobData.parish) : null);
          if (jobRegion && jobRegion !== studentRegion) continue;
        }

        if (filters?.jobTypes && filters.jobTypes.length > 0) {
          if (!filters.jobTypes.includes(jobData.job_type)) continue;
        }
        if (filters?.parishes && filters.parishes.length > 0) {
          if (!jobData.parish || !filters.parishes.includes(jobData.parish)) continue;
        }
        if (filters?.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matches = jobData.title?.toLowerCase().includes(q) ||
            jobData.description?.toLowerCase().includes(q) ||
            jobData.location?.toLowerCase().includes(q);
          if (!matches) continue;
        }

        if (jobData.business_id) {
          const bizSnap = await getDoc(doc(db, 'businesses', jobData.business_id));
          if (bizSnap.exists()) {
            const bizData = bizSnap.data();
            if (bizData.account_status === 'suspended' || bizData.account_status === 'banned') continue;
            jobData.business = normalizeBusinessData(bizData) as Business;
          }
        }

        const entry = { ...jobData } as Job & { matchScore?: number };
        if (studentProfile) {
          entry.matchScore = calculateMatchScore(jobData, studentProfile);
        }

        jobs.push(entry);
      }

      return jobs.sort((a, b) => {
        const aTime = (a as any).createdAt?.toDate?.() || new Date(0);
        const bTime = (b as any).createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
    },
  });
}

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');
      const jobSnap = await getDoc(doc(db, 'jobs', jobId));
      if (!jobSnap.exists()) throw new Error('Job not found');
      const jobData = { id: jobSnap.id, ...jobSnap.data() } as Job;
      if (jobData.business_id) {
        const bizSnap = await getDoc(doc(db, 'businesses', jobData.business_id));
        if (bizSnap.exists()) jobData.business = normalizeBusinessData(bizSnap.data()) as Business;
      }
      return jobData;
    },
    enabled: !!jobId,
  });
}

export function useBusinessJobs() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['businessJobs', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const q = query(collection(db, 'jobs'), where('business_id', '==', user.uid));
      const snapshot = await getDocs(q);
      const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[];
      return jobs.sort((a, b) => {
        const aTime = (a as any).createdAt?.toDate?.() || new Date(0);
        const bTime = (b as any).createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
    },
    enabled: !!user,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (jobData: CreateJobForm & { status?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const region = jobData.parish ? getRegionForParishLocal(jobData.parish) : (jobData.postcode ? 'UK' : null);
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...jobData,
        business_id: user.uid,
        region,
        status: jobData.status || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as Job;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessJobs'] }),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: string; updates: Partial<Job> }) => {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, { ...updates, updatedAt: serverTimestamp() });
      const snap = await getDoc(jobRef);
      return { id: snap.id, ...snap.data() } as Job;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businessJobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.id] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      await deleteDoc(doc(db, 'jobs', jobId));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessJobs'] }),
  });
}

export function useSavedJobs() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['savedJobs', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const q = query(collection(db, 'saved_jobs'), where('student_id', '==', user.uid));
      const snapshot = await getDocs(q);
      const savedJobs = [];
      for (const d of snapshot.docs) {
        const data = { ...d.data() };
        if (data.job_id) {
          const jobSnap = await getDoc(doc(db, 'jobs', data.job_id));
          if (jobSnap.exists()) {
            const jobData = { id: jobSnap.id, ...jobSnap.data() } as Job;
            if (jobData.business_id) {
              const bizSnap = await getDoc(doc(db, 'businesses', jobData.business_id));
              if (bizSnap.exists()) jobData.business = normalizeBusinessData(bizSnap.data()) as Business;
            }
            savedJobs.push({ id: d.id, job_id: data.job_id as string, student_id: data.student_id as string, created_at: data.createdAt as string, job: jobData });
          }
        }
      }
      return savedJobs;
    },
    enabled: !!user,
  });
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (isSaved) {
        const q = query(collection(db, 'saved_jobs'), where('student_id', '==', user.uid), where('job_id', '==', jobId));
        const snap = await getDocs(q);
        for (const d of snap.docs) await deleteDoc(doc(db, 'saved_jobs', d.id));
      } else {
        await addDoc(collection(db, 'saved_jobs'), { student_id: user.uid, job_id: jobId, createdAt: serverTimestamp() });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
  });
}
