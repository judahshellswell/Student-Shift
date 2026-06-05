'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StudentSidebar, StudentMobileTabBar } from '@/components/layout/StudentSidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, userType } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) { router.replace('/auth/login'); return; }
    if (userType === 'business') { router.replace('/business'); return; }
  }, [isInitialized, isAuthenticated, userType, router]);

  if (!isInitialized || !isAuthenticated) return <PageLoader />;
  if (userType === 'business') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar />
      <main className="lg:pl-64 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
      <StudentMobileTabBar />
    </div>
  );
}
