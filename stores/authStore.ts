'use client';

import { create } from 'zustand';
import {
  auth,
  db,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from '@/lib/firebase';
import type { User } from 'firebase/auth';
import type { Profile, Student, Business, UserType } from '@/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  studentProfile: Student | null;
  businessProfile: Business | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  userType: UserType | null;
  needsProfileSetup: boolean;
  _unsubscribeStudentListener: (() => void) | null;

  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  updateStudentProfile: (updates: Partial<Student>) => Promise<void>;
  updateBusinessProfile: (updates: Partial<Business>) => Promise<void>;
  clearNeedsProfileSetup: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  studentProfile: null,
  businessProfile: null,
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
  userType: null,
  needsProfileSetup: false,
  _unsubscribeStudentListener: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      onAuthStateChanged(auth, async (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          await get().fetchProfile();
        } else {
          get()._unsubscribeStudentListener?.();
          set({
            profile: null,
            studentProfile: null,
            businessProfile: null,
            userType: null,
            needsProfileSetup: false,
            _unsubscribeStudentListener: null,
          });
        }
        set({ isLoading: false, isInitialized: true });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        set({ needsProfileSetup: true });
        return;
      }

      set({ needsProfileSetup: false });
      const profileData = profileSnap.data();
      const userTypeValue = profileData?.userType || profileData?.user_type;
      const profile = { id: profileSnap.id, ...profileData, user_type: userTypeValue } as Profile;
      set({ profile, userType: userTypeValue ?? null });

      if (userTypeValue === 'student') {
        get()._unsubscribeStudentListener?.();
        const studentRef = doc(db, 'students', user.uid);
        const unsubscribe = onSnapshot(studentRef, (snap) => {
          if (snap.exists()) {
            set({ studentProfile: { id: snap.id, ...snap.data() } as Student });
          }
        });
        set({ _unsubscribeStudentListener: unsubscribe, businessProfile: null });
      } else if (userTypeValue === 'business') {
        const businessRef = doc(db, 'businesses', user.uid);
        const businessSnap = await getDoc(businessRef);
        if (businessSnap.exists()) {
          set({ businessProfile: { id: businessSnap.id, ...businessSnap.data() } as Business, studentProfile: null });
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      get()._unsubscribeStudentListener?.();
      await firebaseSignOut(auth);
      set({
        user: null,
        profile: null,
        studentProfile: null,
        businessProfile: null,
        isAuthenticated: false,
        userType: null,
        needsProfileSetup: false,
        _unsubscribeStudentListener: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStudentProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');
    const studentRef = doc(db, 'students', user.uid);
    await updateDoc(studentRef, { ...updates, updatedAt: serverTimestamp() });
    const snap = await getDoc(studentRef);
    if (snap.exists()) {
      set({ studentProfile: { id: snap.id, ...snap.data() } as Student });
    }
  },

  updateBusinessProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');
    const businessRef = doc(db, 'businesses', user.uid);
    await updateDoc(businessRef, { ...updates, updatedAt: serverTimestamp() });
    const snap = await getDoc(businessRef);
    if (snap.exists()) {
      set({ businessProfile: { id: snap.id, ...snap.data() } as Business });
    }
  },

  clearNeedsProfileSetup: () => set({ needsProfileSetup: false }),
}));
