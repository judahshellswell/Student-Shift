import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Prevent duplicate initialization during hot reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Set local persistence so sessions survive page refreshes — browser only
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

export { app, auth, db, storage, functions, httpsCallable };

// Firestore utilities
export {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
};

// Storage utilities
export { ref, uploadBytes, getDownloadURL, deleteObject };

// Auth utilities
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseSignOut as signOut,
  onAuthStateChanged,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
};

export type { User } from 'firebase/auth';

export const getCurrentUser = () => auth.currentUser;

// Upload a File to Firebase Storage and return the download URL
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// Compress an image file via canvas before upload (keeps file < ~200KB)
export async function compressImage(file: File, maxDimension = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(maxDimension / img.width, maxDimension / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        0.82
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Check video duration from a File (client-side, no upload)
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = reject;
    video.src = url;
  });
}

// Create base profile + type-specific profile in Firestore
export const createUserProfile = async (
  userId: string,
  data: {
    email: string;
    userType: 'student' | 'business';
    firstName?: string;
    lastName?: string;
    businessName?: string;
    contactName?: string;
    contactEmail?: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
    cvUrl?: string;
    introVideoUrl?: string;
    website?: string;
    logoUrl?: string;
    region?: string;
    parish?: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    description?: string;
    skills?: string[];
    preferredParishes?: string[];
    availability?: Record<string, unknown>;
    dateOfBirth?: string;
    schoolOrCollege?: string;
    searchRadiusKm?: number;
  }
) => {
  const profileRef = doc(db, 'profiles', userId);
  await setDoc(profileRef, {
    id: userId,
    user_type: data.userType,
    userType: data.userType,
    email: data.email,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (data.userType === 'student') {
    const studentRef = doc(db, 'students', userId);
    await setDoc(studentRef, {
      id: userId,
      email: data.email,
      first_name: data.firstName || '',
      last_name: data.lastName || '',
      date_of_birth: data.dateOfBirth || '',
      school_or_college: data.schoolOrCollege || null,
      phone: data.phone || null,
      bio: data.bio || null,
      avatar_url: data.avatarUrl || null,
      cv_url: data.cvUrl || null,
      intro_video_url: data.introVideoUrl || null,
      skills: data.skills || [],
      availability: data.availability || {},
      experience: [],
      preferred_parishes: data.preferredParishes || [],
      region: data.region || null,
      postcode: data.postcode || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      search_radius_km: data.searchRadiusKm ?? null,
      is_profile_complete: false,
      is_verified: false,
      work_ready_completed: [],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } else if (data.userType === 'business') {
    const businessRef = doc(db, 'businesses', userId);
    await setDoc(businessRef, {
      id: userId,
      business_name: data.businessName || '',
      contact_name: data.contactName || '',
      email: data.contactEmail || data.email,
      phone: data.phone || null,
      description: data.description || null,
      logo_url: data.logoUrl || null,
      website: data.website || null,
      address: data.address || null,
      region: data.region || null,
      parish: data.parish || null,
      postcode: data.postcode || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      is_verified: false,
      verification_tier: 'unverified',
      account_status: 'active',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }
};

export const getUserProfile = async (userId: string) => {
  const snap = await getDoc(doc(db, 'profiles', userId));
  return snap.exists() ? snap.data() : null;
};

export const getStudentProfile = async (userId: string) => {
  const snap = await getDoc(doc(db, 'students', userId));
  return snap.exists() ? snap.data() : null;
};

export const getBusinessProfile = async (userId: string) => {
  const snap = await getDoc(doc(db, 'businesses', userId));
  return snap.exists() ? snap.data() : null;
};
