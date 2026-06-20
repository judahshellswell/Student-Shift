'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, functions, httpsCallable, collection, query, where, getDocs } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import type { Report, CreateReportForm } from '@/types';

// Submit a report via Cloud Function
export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: CreateReportForm) => {
      const submitReportFn = httpsCallable(functions, 'submitReport');
      const result = await submitReportFn({
        reportedId: form.reported_id,
        reportedType: form.reported_type,
        category: form.category,
        description: form.description,
        conversationId: form.conversation_id,
      });
      return result.data as { reportId: string; priority: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

// Fetch reports submitted by the current user
export function useMyReports() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['reports', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const reportsRef = collection(db, 'reports');
      const q = query(reportsRef, where('reporter_id', '==', user.uid));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Report);
    },
    enabled: !!user,
  });
}
