'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ALL_QUIZZES } from '@/content/quizzes';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateStudentProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

export default function QuizPage() {
  const { sectionKey } = useParams<{ sectionKey: string }>();
  const router = useRouter();
  const { studentProfile } = useAuthStore();
  const updateProfile = useUpdateStudentProfile();
  const { showSuccess } = useToast();

  const quiz = ALL_QUIZZES.find((q) => q.key === sectionKey);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Quiz not found.</p>
        <Link href="/student/workready" className="text-primary hover:underline text-sm mt-2 block">← Back to Work Ready</Link>
      </div>
    );
  }

  const currentQ = quiz.questions[step];
  const completedContent: string[] = (studentProfile as any)?.work_ready_completed ?? [];
  const alreadyDone = completedContent.includes(quiz.key);

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === currentQ.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (step + 1 < quiz.questions.length) {
      setStep((s) => s + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setDone(true);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (!alreadyDone) {
        const updated = [...completedContent, quiz.key];
        await updateProfile.mutateAsync({ work_ready_completed: updated } as any);
      }
      showSuccess(`+6 pts! "${quiz.title}" completed.`);
      router.push('/student/workready');
    } catch {
      router.push('/student/workready');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/student/workready" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Work Ready
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{quiz.emoji}</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-text-secondary">{quiz.subtitle}</p>
        </div>
      </div>

      {alreadyDone && (
        <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="text-sm text-green-800 font-medium">You&apos;ve already completed this quiz.</span>
        </div>
      )}

      {!done ? (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">Question {step + 1} of {quiz.questions.length}</p>
            <div className="flex gap-1">
              {quiz.questions.map((_, i) => (
                <div key={i} className={cn('w-2 h-2 rounded-full', i <= step ? 'bg-primary' : 'bg-gray-200')} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <p className="text-base font-semibold text-gray-900 mb-4">{currentQ.question}</p>
            <div className="space-y-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selected === idx;
                const isCorrect = currentQ.correct === idx;

                let optClass = 'border-gray-200 bg-white text-gray-700 hover:border-primary cursor-pointer';
                if (showResult && isCorrect) optClass = 'border-success bg-green-50 text-green-800';
                else if (showResult && isSelected && !isCorrect) optClass = 'border-error bg-red-50 text-red-800';
                else if (isSelected && !showResult) optClass = 'border-primary bg-primary-bg text-primary';

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showResult}
                    className={cn('w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors', optClass)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {showResult && (
              <p className="mt-3 text-sm text-gray-600 italic">{currentQ.explanation}</p>
            )}
          </div>

          {showResult && (
            <Button fullWidth size="lg" onClick={handleNext}>
              {step + 1 < quiz.questions.length ? 'Next →' : 'See results'}
            </Button>
          )}
        </>
      ) : (
        /* Results screen */
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-4xl mb-3">{score === quiz.questions.length ? '🎉' : score >= quiz.questions.length * 0.6 ? '👍' : '📚'}</p>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{score}/{quiz.questions.length} correct</h2>
          <p className="text-sm text-text-secondary mb-6">
            {score === quiz.questions.length ? 'Perfect score!' : score >= quiz.questions.length * 0.6 ? 'Great effort!' : 'Keep practising!'}
            {' '}All quiz completions earn +6 pts regardless of score.
          </p>
          <Button fullWidth size="lg" loading={loading} onClick={handleFinish}>
            Claim +6 pts and return to Work Ready
          </Button>
        </div>
      )}
    </div>
  );
}
