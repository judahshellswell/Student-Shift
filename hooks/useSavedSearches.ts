'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  db, collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, serverTimestamp,
} from '@/lib/firebase';
import type { SavedSearch, CreateSavedSearchForm } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export function useSavedSearches() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['savedSearches', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const q = query(collection(db, 'savedSearches'), where('student_id', '==', user.uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SavedSearch[];
    },
    enabled: !!user,
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (data: CreateSavedSearchForm) => {
      if (!user) throw new Error('Not authenticated');
      const docRef = await addDoc(collection(db, 'savedSearches'), {
        ...data,
        student_id: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as SavedSearch;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches'] }),
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'savedSearches', id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches'] }),
  });
}

export function useToggleSavedSearchNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notify }: { id: string; notify: boolean }) => {
      await updateDoc(doc(db, 'savedSearches', id), { notify_new_jobs: notify, updatedAt: serverTimestamp() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches'] }),
  });
}
