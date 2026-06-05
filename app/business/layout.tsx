'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { BusinessSidebar, BusinessMobileTabBar } from '@/components/layout/BusinessSidebar';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, userType } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) { router.replace('/auth/login'); return; }
    if (userType === 'student') { router.replace('/student'); return; }
  }, [isInitialized, isAuthenticated, userType, router]);

  if (!isInitialized || !isAuthenticated) return <PageLoader />;
  if (userType === 'student') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar />
      <main className="lg:pl-64 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
      <BusinessMobileTabBar />
    </div>
  );
}
