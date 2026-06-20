'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useReadinessScore } from '@/hooks/useReadinessScore';
import { ReadinessScoreRing } from '@/components/ui/ReadinessScoreRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { CONTENT_ITEMS, SECTIONS } from '@/content/articles';
import { SECTION_QUIZZES, FINAL_QUIZ } from '@/content/quizzes';
import { cn } from '@/lib/utils';

export default function WorkReadyPage() {
  const { studentProfile } = useAuthStore();
  const completedContent: string[] = (studentProfile as any)?.work_ready_completed ?? [];
  const readiness = useReadinessScore(studentProfile, completedContent);
  const isWorkReady = readiness.level === 'work_ready';

  // Profile completion items (non-content)
  const profileItems = readiness.items.filter((i) => i.category !== 'preparation');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Work Ready</h1>
      <p className="text-sm text-text-secondary mb-6">Complete every guide and quiz to unlock job applications</p>

      {/* Score card */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-6">
          <ReadinessScoreRing score={readiness.score} color={readiness.color} label={readiness.label} size={100} />
          <div className="flex-1 min-w-0">
            <ProgressBar value={readiness.score} color={readiness.color} height="md" className="mb-2" />
            {isWorkReady ? (
              <p className="text-sm font-semibold text-success">🎉 You are Work Ready! You can now apply for jobs.</p>
            ) : (
              <p className="text-sm text-text-secondary">
                <span className="font-semibold text-gray-900">{readiness.totalPoints - readiness.completedPoints} points to go</span> until Work Ready
              </p>
            )}
          </div>
        </div>

        {/* Profile checklist */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {profileItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              {item.isComplete ? (
                <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                </svg>
              )}
              <span className={cn('text-xs', item.isComplete ? 'text-gray-500 line-through' : 'text-gray-700')}>{item.label}</span>
              {!item.isComplete && <span className="text-xs text-primary ml-auto">+{item.points}</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* Sections */}
      {SECTIONS.filter((s) => s.key !== 'Final quiz').map((section) => {
        const articles = CONTENT_ITEMS.filter((i) => i.section === section.key);
        const quizzes = SECTION_QUIZZES.filter((q) => q.section === section.key);
        const sectionDone = [...articles, ...quizzes].filter((i) => completedContent.includes(i.key)).length;
        const sectionTotal = articles.length + quizzes.length;

        return (
          <div key={section.key} className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900">{section.label}</h2>
              <span className="text-xs text-text-secondary">{sectionDone}/{sectionTotal} done · {section.subtitle}</span>
            </div>

            <div className="space-y-2">
              {articles.map((item) => {
                const done = completedContent.includes(item.key);
                return (
                  <Link key={item.key} href={`/student/workready/${item.key}`}>
                    <div className={cn(
                      'bg-white rounded-lg border px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer',
                      done ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    )}>
                      <span className="text-xl flex-shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-text-secondary">{item.readTime} · includes 3 check questions</p>
                      </div>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
                        done ? 'bg-green-100 text-green-700' : 'bg-primary-bg text-primary'
                      )}>
                        {done ? '✓ Done' : '+6 pts'}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {quizzes.map((quiz) => {
                const done = completedContent.includes(quiz.key);
                return (
                  <Link key={quiz.key} href={`/student/workready/quiz/${quiz.key}`}>
                    <div className={cn(
                      'bg-white rounded-lg border px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer',
                      done ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    )}>
                      <span className="text-xl flex-shrink-0">{quiz.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{quiz.title}</p>
                        <p className="text-xs text-text-secondary">{quiz.questions.length} questions</p>
                      </div>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
                        done ? 'bg-green-100 text-green-700' : 'bg-primary-bg text-primary'
                      )}>
                        {done ? '✓ Done' : '+6 pts'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Final quiz */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900">Final Quiz</h2>
          <span className="text-xs text-text-secondary">+6 pts</span>
        </div>
        {(() => {
          const done = completedContent.includes(FINAL_QUIZ.key);
          return (
            <Link href={`/student/workready/quiz/${FINAL_QUIZ.key}`}>
              <div className={cn(
                'bg-white rounded-lg border px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer',
                done ? 'border-green-200 bg-green-50' : 'border-secondary-bg border-dashed'
              )}>
                <span className="text-xl">{FINAL_QUIZ.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{FINAL_QUIZ.title}</p>
                  <p className="text-xs text-text-secondary">{FINAL_QUIZ.questions.length} questions · Everything covered</p>
                </div>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  done ? 'bg-green-100 text-green-700' : 'bg-secondary-bg text-secondary-dark'
                )}>
                  {done ? '✓ Done' : '+6 pts'}
                </span>
              </div>
            </Link>
          );
        })()}
      </div>
    </div>
  );
}
