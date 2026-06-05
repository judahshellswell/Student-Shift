'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  db, collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, serverTimestamp,
} from '@/lib/firebase';
import type { Application, ApplicationStatus, Job, Student, Business } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export function useStudentApplications() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['studentApplications', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const q = query(collection(db, 'applications'), where('student_id', '==', user.uid));
      const snapshot = await getDocs(q);
      const applications: Application[] = [];

      for (const d of snapshot.docs) {
        const appData = { id: d.id, ...d.data() } as Application;
        if (appData.job_id) {
          const jobSnap = await getDoc(doc(db, 'jobs', appData.job_id));
          if (jobSnap.exists()) {
            const jobData = { id: jobSnap.id, ...jobSnap.data() } as Job;
            if (jobData.business_id) {
              const bizSnap = await getDoc(doc(db, 'businesses', jobData.business_id));
              if (bizSnap.exists()) jobData.business = { id: bizSnap.id, ...bizSnap.data() } as Business;
            }
            appData.job = jobData;
          }
        }
        applications.push(appData);
      }

      return applications.sort((a, b) => {
        const at = (a as any).createdAt?.toDate?.() || new Date(0);
        const bt = (b as any).createdAt?.toDate?.() || new Date(0);
        return bt.getTime() - at.getTime();
      });
    },
    enabled: !!user,
  });
}

export function useJobApplications(jobId: string | undefined) {
  return useQuery({
    queryKey: ['jobApplications', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');
      const q = query(collection(db, 'applications'), where('job_id', '==', jobId));
      const snapshot = await getDocs(q);
      const applications: Application[] = [];

      for (const d of snapshot.docs) {
        const appData = { id: d.id, ...d.data() } as Application;
        if (appData.student_id) {
          const studentSnap = await getDoc(doc(db, 'students', appData.student_id));
          if (studentSnap.exists()) appData.student = { id: studentSnap.id, ...studentSnap.data() } as Student;
        }
        applications.push(appData);
      }

      return applications.sort((a, b) => {
        const at = (a as any).createdAt?.toDate?.() || new Date(0);
        const bt = (b as any).createdAt?.toDate?.() || new Date(0);
        return bt.getTime() - at.getTime();
      });
    },
    enabled: !!jobId,
  });
}

export function useAllBusinessApplications() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['allBusinessApplications', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const jobsQ = query(collection(db, 'jobs'), where('business_id', '==', user.uid));
      const jobsSnap = await getDocs(jobsQ);
      const jobIds = jobsSnap.docs.map((d) => d.id);

      const applications: Application[] = [];
      for (const jobId of jobIds) {
        const q = query(collection(db, 'applications'), where('job_id', '==', jobId));
        const appSnap = await getDocs(q);
        for (const d of appSnap.docs) {
          const appData = { id: d.id, ...d.data() } as Application;
          const jobDoc = jobsSnap.docs.find((j) => j.id === jobId);
          if (jobDoc) appData.job = { id: jobDoc.id, ...jobDoc.data() } as Job;
          if (appData.student_id) {
            const studentSnap = await getDoc(doc(db, 'students', appData.student_id));
            if (studentSnap.exists()) appData.student = { id: studentSnap.id, ...studentSnap.data() } as Student;
          }
          applications.push(appData);
        }
      }

      return applications.sort((a, b) => {
        const at = (a as any).createdAt?.toDate?.() || new Date(0);
        const bt = (b as any).createdAt?.toDate?.() || new Date(0);
        return bt.getTime() - at.getTime();
      });
    },
    enabled: !!user,
  });
}

export function useHasApplied(jobId: string | undefined) {
  const { data: applications } = useStudentApplications();
  if (!jobId) return false;
  return applications?.some((app) => app.job_id === jobId) ?? false;
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ jobId, coverMessage }: { jobId: string; coverMessage?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const docRef = await addDoc(collection(db, 'applications'), {
        job_id: jobId,
        student_id: user.uid,
        cover_message: coverMessage || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as Application;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentApplications'] }),
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) => {
      const appRef = doc(db, 'applications', applicationId);
      await updateDoc(appRef, { status, updatedAt: serverTimestamp() });
      const snap = await getDoc(appRef);
      return { id: snap.id, ...snap.data() } as Application;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications', data.job_id] });
      queryClient.invalidateQueries({ queryKey: ['allBusinessApplications'] });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      const appRef = doc(db, 'applications', applicationId);
      await updateDoc(appRef, { status: 'withdrawn', updatedAt: serverTimestamp() });
      const snap = await getDoc(appRef);
      return { id: snap.id, ...snap.data() } as Application;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentApplications'] }),
  });
}
