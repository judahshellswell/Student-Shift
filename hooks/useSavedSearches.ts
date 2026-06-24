'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  db, collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp,
} from '@/lib/firebase';
import type { SavedSearch, CreateSavedSearchForm } from '@/types';
import { useAuthStore } from '@/stores/authStore';

// Fetch all saved searches for the current student
export function useSavedSearches() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['savedSearches', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const searchesRef = collection(db, 'saved_searches');
      const searchesQuery = query(searchesRef, where('student_id', '==', user.uid), orderBy('created_at', 'desc'));
      const snap = await getDocs(searchesQuery);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SavedSearch[];
    },
    enabled: !!user,
  });
}

// Create a new saved search
export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (searchData: CreateSavedSearchForm) => {
      if (!user) throw new Error('Not authenticated');
      const searchesRef = collection(db, 'saved_searches');
      const docRef = await addDoc(searchesRef, {
        ...searchData,
        student_id: user.uid,
        notify_new_jobs: searchData.notify_new_jobs ?? false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return {
        id: docRef.id,
        ...searchData,
        student_id: user.uid,
        notify_new_jobs: searchData.notify_new_jobs ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as SavedSearch;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches', user?.uid] }),
  });
}

// Update a saved search
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ searchId, updates }: { searchId: string; updates: Partial<CreateSavedSearchForm> }) => {
      if (!user) throw new Error('Not authenticated');
      await updateDoc(doc(db, 'saved_searches', searchId), { ...updates, updated_at: serverTimestamp() });
      return { searchId, updates };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches', user?.uid] }),
  });
}

// Delete a saved search
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (searchId: string) => {
      if (!user) throw new Error('Not authenticated');
      await deleteDoc(doc(db, 'saved_searches', searchId));
      return searchId;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches', user?.uid] }),
  });
}

// Toggle notify-on-new-jobs for a saved search
export function useToggleSavedSearchNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ id, notify }: { id: string; notify: boolean }) => {
      await updateDoc(doc(db, 'saved_searches', id), { notify_new_jobs: notify, updated_at: serverTimestamp() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches', user?.uid] }),
  });
}
