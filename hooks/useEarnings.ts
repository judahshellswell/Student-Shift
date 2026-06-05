'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  db, collection, query, where, getDocs, getDoc, doc, addDoc, deleteDoc, serverTimestamp,
} from '@/lib/firebase';
import type { Earning, CreateEarningForm, EarningsSummary } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

export function useEarnings() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['earnings', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const q = query(collection(db, 'earnings'), where('student_id', '==', user.uid));
      const snap = await getDocs(q);
      const earnings = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Earning[];
      return earnings.sort((a, b) => {
        const at = (a as any).createdAt?.toDate?.() || new Date(0);
        const bt = (b as any).createdAt?.toDate?.() || new Date(0);
        return bt.getTime() - at.getTime();
      });
    },
    enabled: !!user,
  });
}

export function useEarningsSummary() {
  const { data: earnings } = useEarnings();

  if (!earnings) return null;

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const yearStart = startOfYear(now);

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalHours = earnings.reduce((sum, e) => sum + e.hours_worked, 0);
  const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;

  const thisMonth = earnings
    .filter((e) => new Date(e.date) >= thisMonthStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const lastMonth = earnings
    .filter((e) => new Date(e.date) >= lastMonthStart && new Date(e.date) <= lastMonthEnd)
    .reduce((sum, e) => sum + e.amount, 0);

  const thisYear = earnings
    .filter((e) => new Date(e.date) >= yearStart)
    .reduce((sum, e) => sum + e.amount, 0);

  // Last 6 months
  const earningsByMonth = Array.from({ length: 6 }).map((_, i) => {
    const month = subMonths(now, 5 - i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const amount = earnings
      .filter((e) => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
      .reduce((sum, e) => sum + e.amount, 0);
    return { month: format(month, 'MMM'), amount };
  });

  const summary: EarningsSummary = {
    totalEarnings, totalHours, averageHourlyRate,
    thisMonth, lastMonth, thisYear, earningsByMonth,
  };

  return summary;
}

export function useLogEarning() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (data: CreateEarningForm) => {
      if (!user) throw new Error('Not authenticated');
      const docRef = await addDoc(collection(db, 'earnings'), {
        ...data,
        student_id: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as Earning;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['earnings'] }),
  });
}

export function useDeleteEarning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (earningId: string) => {
      await deleteDoc(doc(db, 'earnings', earningId));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['earnings'] }),
  });
}
