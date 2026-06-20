'use client';

import Link from 'next/link';
import { AppLogo } from '@/components/layout/AppLogo';
import { useAuthStore } from '@/stores/authStore';

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-primary-bg flex items-center justify-center text-primary flex-shrink-0">
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { isInitialized, isAuthenticated, userType } = useAuthStore();
  const dashboardHref = userType === 'business' ? '/business' : '/student';
  const showLoggedIn = isInitialized && isAuthenticated;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <AppLogo />
          <div className="flex items-center gap-3">
            {showLoggedIn ? (
              <Link href={dashboardHref} className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-primary">Sign in</Link>
                <Link href="/auth/welcome" className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary-bg py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary-bg text-secondary-dark text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🎉 Now live in Jersey, Guernsey & Isle of Man
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Find flexible work<br />
            <span className="text-primary">around your studies</span>
          </h1>
          <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
            StudentShift connects students aged 16–24 to part-time and shift work in the Channel Islands, Isle of Man, and the UK.
          </p>
          {showLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={dashboardHref} className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors text-center">
                Go to your dashboard
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/register/student" className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors text-center">
                  Find a job
                </Link>
                <Link href="/auth/register/business" className="bg-white text-secondary-dark font-semibold px-6 py-3 rounded-lg border-2 border-secondary hover:bg-secondary-bg transition-colors text-center">
                  Post a job
                </Link>
              </div>
              <p className="text-sm text-text-secondary mt-4">
                <Link href="/jobs" className="hover:underline">Browse jobs without signing up →</Link>
              </p>
            </>
          )}
        </div>
      </section>

      {/* How it works — students */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works for students</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create your profile', desc: 'Add your skills, availability, and a short bio. Upload your CV and an intro video for extra impact.' },
              { step: '2', title: 'Complete Work Ready', desc: 'Work through 11 guides and quizzes to build real workplace skills and unlock your ability to apply for jobs.' },
              { step: '3', title: 'Apply with confidence', desc: 'Browse jobs matched to your skills and location. Apply in seconds with a personalised cover message.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">{step}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Ready highlight */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="text-4xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">The Work Ready Hub</h2>
            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
              Before you can apply for jobs, you&apos;ll complete our free Work Ready course — 11 guides and quizzes covering everything from your first shift to nailing an interview. It&apos;s not just a box to tick; it&apos;s genuine preparation.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left mb-8">
              {['Workplace basics', 'Interview skills', 'Research skills', 'Workplace attitude'].map((s) => (
                <div key={s} className="bg-primary-bg rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary">{s}</p>
                </div>
              ))}
            </div>
            <Link href={showLoggedIn ? dashboardHref : '/auth/register/student'} className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors inline-block">
              {showLoggedIn ? 'Go to dashboard →' : 'Start for free →'}
            </Link>
          </div>
        </div>
      </section>

      {/* For businesses */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">For businesses</h2>
          <p className="text-text-secondary text-center mb-10 max-w-xl mx-auto">
            Post jobs and find motivated, Work Ready young people. Every student who applies has completed our preparation course.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '📋', title: 'Post in minutes', desc: 'Create a detailed job listing with pay, hours, location, and required skills in under 5 minutes.' },
              { icon: '🎯', title: 'Smart matching', desc: 'Students see a match score based on their skills and availability. You get better, more relevant applications.' },
              { icon: '✅', title: 'Pre-prepared applicants', desc: 'Every applicant has completed our Work Ready course — they understand employer expectations before they arrive.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-secondary-bg rounded-xl p-6">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href={showLoggedIn ? dashboardHref : '/auth/register/business'} className="bg-secondary text-white font-semibold px-6 py-3 rounded-lg hover:bg-secondary-dark transition-colors inline-block">
              {showLoggedIn ? 'Go to dashboard →' : 'Post a job free →'}
            </Link>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-12 px-4 bg-primary-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Built with safeguarding at the core</h2>
          <p className="text-sm text-text-secondary max-w-2xl mx-auto">
            StudentShift is being developed in partnership with Jersey&apos;s government and safeguarding organisations. All accounts are verified, and our messaging feature is undergoing a full safeguarding review before launch.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <AppLogo />
          <div className="flex gap-6 text-sm text-text-secondary">
            <Link href="/jobs" className="hover:text-gray-900">Browse Jobs</Link>
            {showLoggedIn ? (
              <Link href={dashboardHref} className="hover:text-gray-900">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/welcome" className="hover:text-gray-900">Sign Up</Link>
                <Link href="/auth/login" className="hover:text-gray-900">Sign In</Link>
              </>
            )}
          </div>
          <p className="text-xs text-text-secondary">© {new Date().getFullYear()} StudentShift</p>
        </div>
      </footer>
    </div>
  );
}
