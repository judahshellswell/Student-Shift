'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, userType } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      router.replace(userType === 'business' ? '/business' : '/student');
    }
  }, [isInitialized, isAuthenticated, userType, router]);

  // While checking auth, show nothing to avoid flash
  if (isInitialized && isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {children}
    </div>
  );
}
