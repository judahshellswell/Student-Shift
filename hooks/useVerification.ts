'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { auth, functions, httpsCallable, db, collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

export function useSendPhoneOtp() {
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (phone: string) => {
      if (!user) throw new Error('Not authenticated');
      const sendPhoneOtp = httpsCallable(functions, 'sendPhoneOtp');
      await sendPhoneOtp({ phone });
    },
  });
}

export function useVerifyPhoneOtp() {
  const { fetchProfile } = useAuthStore();
  return useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const verifyPhoneOtp = httpsCallable(functions, 'verifyPhoneOtp');
      const result = await verifyPhoneOtp({ phone, otp }) as { data: { success: boolean } };
      if (!result.data?.success) throw new Error('Invalid or expired code');
      await fetchProfile();
    },
  });
}

export function useCheckSignupBanned() {
  return useMutation({
    mutationFn: async ({ email, phone }: { email: string; phone?: string }) => {
      const checkSignupBanned = httpsCallable(functions, 'checkSignupBanned');
      const result = await checkSignupBanned({ email, phone }) as { data: { banned: boolean; reason?: string } };
      return result.data;
    },
  });
}

export function useSendSchoolVerification() {
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (schoolEmail: string) => {
      if (!user) throw new Error('Not authenticated');
      const sendVerification = httpsCallable(functions, 'sendVerificationEmail');
      await sendVerification({ schoolEmail });
    },
  });
}

export function useApprovedSchools() {
  return useQuery({
    queryKey: ['approvedSchools'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'approved_domains'));
      return snap.docs.map((d) => d.data());
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
