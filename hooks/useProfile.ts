'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  db, collection, query, where, getDocs, getDoc, doc,
  addDoc, updateDoc, deleteDoc, serverTimestamp,
  uploadFile, compressImage,
} from '@/lib/firebase';
import type { Student, PortfolioPost, PortfolioPostType, Review } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export function useUpdateStudentProfile() {
  const { updateStudentProfile } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Student>) => {
      await updateStudentProfile(updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentProfile'] }),
  });
}

export function useUploadAvatar() {
  const { user, updateStudentProfile } = useAuthStore();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');
      const compressed = await compressImage(file);
      const ext = file.name.split('.').pop() || 'jpg';
      const url = await uploadFile(compressed as File, `avatars/${user.uid}/avatar.${ext}`);
      await updateStudentProfile({ avatar_url: url });
      return url;
    },
  });
}

export function useUploadCV() {
  const { user, updateStudentProfile } = useAuthStore();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop() || 'pdf';
      const url = await uploadFile(file, `cvs/${user.uid}/cv.${ext}`);
      await updateStudentProfile({ cv_url: url });
      return url;
    },
  });
}

export function useUploadIntroVideo() {
  const { user, updateStudentProfile } = useAuthStore();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop() || 'mp4';
      const url = await uploadFile(file, `intro_videos/${user.uid}/intro.${ext}`);
      await updateStudentProfile({ intro_video_url: url });
      return url;
    },
  });
}

export function usePortfolioPosts(studentId?: string) {
  const { user } = useAuthStore();
  const id = studentId || user?.uid;
  return useQuery({
    queryKey: ['portfolioPosts', id],
    queryFn: async () => {
      if (!id) throw new Error('No student ID');
      const q = query(collection(db, 'portfolioPosts'), where('student_id', '==', id));
      const snap = await getDocs(q);
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PortfolioPost[];
      return posts.sort((a, b) => {
        const at = (a as any).createdAt?.toDate?.() || new Date(0);
        const bt = (b as any).createdAt?.toDate?.() || new Date(0);
        return bt.getTime() - at.getTime();
      });
    },
    enabled: !!id,
  });
}

export function useAddPortfolioPost() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (data: Omit<PortfolioPost, 'id' | 'student_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const docRef = await addDoc(collection(db, 'portfolioPosts'), {
        ...data,
        student_id: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as PortfolioPost;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolioPosts'] }),
  });
}

export function useDeletePortfolioPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      await deleteDoc(doc(db, 'portfolioPosts', postId));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolioPosts'] }),
  });
}

export function useStudentReviews(studentId?: string) {
  const { user } = useAuthStore();
  const id = studentId || user?.uid;
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      if (!id) throw new Error('No student ID');
      const q = query(collection(db, 'reviews'), where('student_id', '==', id));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Review[];
    },
    enabled: !!id,
  });
}

export function useTemplates() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['templates', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const q = query(collection(db, 'applicationTemplates'), where('student_id', '==', user.uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    enabled: !!user,
  });
}

export function useUploadBusinessLogo() {
  const { user, updateBusinessProfile } = useAuthStore();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');
      const compressed = await compressImage(file);
      const ext = file.name.split('.').pop() || 'jpg';
      const url = await uploadFile(compressed as File, `logos/${user.uid}/logo.${ext}`);
      await updateBusinessProfile({ logo_url: url });
      return url;
    },
  });
}
