'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  db, functions, httpsCallable, collection, query, where, getDocs, doc, getDoc,
} from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import type { BlockedUser } from '@/types';

// Block a user via Cloud Function
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedId: string) => {
      const blockUserFn = httpsCallable(functions, 'blockUser');
      const result = await blockUserFn({ blockedId });
      return result.data as { success: boolean; alreadyBlocked?: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked_users'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['studentApplications'] });
      queryClient.invalidateQueries({ queryKey: ['blocked_either_way'] });
    },
  });
}

// Unblock a user via Cloud Function
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedId: string) => {
      const unblockUserFn = httpsCallable(functions, 'unblockUser');
      const result = await unblockUserFn({ blockedId });
      return result.data as { success: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked_users'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['studentApplications'] });
      queryClient.invalidateQueries({ queryKey: ['blocked_either_way'] });
    },
  });
}

// Fetch list of users blocked by the current user
export function useBlockedUsers() {
  const { user, userType } = useAuthStore();

  return useQuery({
    queryKey: ['blocked_users', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const blockedRef = collection(db, 'blocked_users');
      const q = query(blockedRef, where('blocker_id', '==', user.uid));
      const snapshot = await getDocs(q);

      const blocked = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as BlockedUser);

      const withNames = await Promise.all(
        blocked.map(async (b) => {
          try {
            if (userType === 'business') {
              const studentSnap = await getDoc(doc(db, 'students', b.blocked_id));
              if (studentSnap.exists()) {
                const s = studentSnap.data();
                return { ...b, blocked_name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || b.blocked_id };
              }
            } else {
              const bizSnap = await getDoc(doc(db, 'businesses', b.blocked_id));
              if (bizSnap.exists()) {
                return { ...b, blocked_name: bizSnap.data()?.business_name || b.blocked_id };
              }
            }
            return { ...b, blocked_name: b.blocked_id };
          } catch {
            return { ...b, blocked_name: b.blocked_id };
          }
        })
      );
      return withNames;
    },
    enabled: !!user,
    staleTime: 0,
  });
}

// Check if the current user has blocked a specific user
export function useIsBlocked(userId: string | undefined) {
  const { data: blockedUsers } = useBlockedUsers();
  return blockedUsers?.some((b) => b.blocked_id === userId) || false;
}

// Check if either party has blocked the other (for hiding message/apply actions)
export function useIsBlockedEitherWay(otherUserId: string | undefined) {
  const { user } = useAuthStore();
  const { data: blockedUsers } = useBlockedUsers();

  return useQuery({
    queryKey: ['blocked_either_way', user?.uid, otherUserId],
    queryFn: async () => {
      if (!user || !otherUserId) return false;
      const blockedRef = collection(db, 'blocked_users');
      const q = query(blockedRef, where('blocker_id', '==', otherUserId), where('blocked_id', '==', user.uid));
      const snap = await getDocs(q);
      return !snap.empty;
    },
    enabled: !!user && !!otherUserId,
    staleTime: 0,
    select: (isBlockedByOther) => {
      const hasBlockedOther = blockedUsers?.some((b) => b.blocked_id === otherUserId) || false;
      return isBlockedByOther || hasBlockedOther;
    },
  });
}
