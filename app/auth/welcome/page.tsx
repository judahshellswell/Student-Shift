'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Student</span><span className="text-secondary">Shift</span>
          </h1>
          <p className="text-text-secondary mt-2">Find flexible work around your studies</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">How will you use StudentShift?</h2>

        <div className="flex flex-col gap-4">
          {/* Student card */}
          <Link href="/auth/register/student" className="block">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg className="w-6 h-6 text-primary group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">I&apos;m a Student</h3>
                  <p className="text-sm text-text-secondary">Find part-time and flexible jobs around your studies</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 ml-auto flex-shrink-0 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Business card */}
          <Link href="/auth/register/business" className="block">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-secondary hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-bg flex items-center justify-center flex-shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                  <svg className="w-6 h-6 text-secondary group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">I&apos;m a Business</h3>
                  <p className="text-sm text-text-secondary">Post jobs and find motivated young workers</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 ml-auto flex-shrink-0 group-hover:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-text-secondary mt-8">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
