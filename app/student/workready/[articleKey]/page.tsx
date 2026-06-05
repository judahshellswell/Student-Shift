'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CONTENT_ITEMS } from '@/content/articles';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateStudentProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

type Phase = 'reading' | 'comprehension';

export default function ArticlePage() {
  const { articleKey } = useParams<{ articleKey: string }>();
  const router = useRouter();
  const { studentProfile } = useAuthStore();
  const updateProfile = useUpdateStudentProfile();
  const { showSuccess } = useToast();

  const article = CONTENT_ITEMS.find((i) => i.key === articleKey);

  const [phase, setPhase] = useState<Phase>('reading');
  const [compStep, setCompStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Article not found.</p>
        <Link href="/student/workready" className="text-primary hover:underline text-sm mt-2 block">← Back to Work Ready</Link>
      </div>
    );
  }

  const completedContent: string[] = (studentProfile as any)?.work_ready_completed ?? [];
  const alreadyDone = completedContent.includes(article.key);

  const currentQ = article.comprehension[compStep];

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx !== currentQ.correct) setWrongAnswers((w) => w + 1);
  };

  const handleNext = async () => {
    const totalWrong = wrongAnswers + (selected !== null && selected !== currentQ.correct ? 1 : 0);
    if (compStep + 1 < article.comprehension.length) {
      setCompStep((s) => s + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      const finalWrong = wrongAnswers;
      const passed = finalWrong <= 1;
      if (passed) {
        setLoading(true);
        try {
          if (!alreadyDone) {
            const updated = [...completedContent, article.key];
            await updateProfile.mutateAsync({ work_ready_completed: updated } as any);
          }
          showSuccess(`+6 pts! "${article.title}" completed.`);
          router.push('/student/workready');
        } catch {
          router.push('/student/workready');
        } finally {
          setLoading(false);
        }
      } else {
        setFailed(true);
        setCompStep(0);
        setSelected(null);
        setShowResult(false);
        setWrongAnswers(0);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/student/workready" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Work Ready
      </Link>

      {/* Article header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{article.emoji}</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{article.title}</h1>
          <p className="text-sm text-text-secondary">{article.readTime} · {article.subtitle}</p>
        </div>
      </div>

      {alreadyDone && (
        <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="text-sm text-green-800 font-medium">You&apos;ve already completed this article.</span>
        </div>
      )}

      {phase === 'reading' && (
        <div>
          {/* Article content */}
          <div className="space-y-5 mb-8">
            {article.content.map((section, i) => (
              <div key={i}>
                <h2 className="text-base font-semibold text-gray-900 mb-1.5">{section.heading}</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <Button fullWidth size="lg" onClick={() => { setPhase('comprehension'); setFailed(false); setWrongAnswers(0); setCompStep(0); setSelected(null); setShowResult(false); }}>
            Take the comprehension check →
          </Button>
        </div>
      )}

      {phase === 'comprehension' && (
        <div>
          {failed && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-semibold text-error mb-1">Not quite right — try again</p>
              <p className="text-xs text-red-700">You got more than 1 question wrong. Have another go at the check.</p>
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">Question {compStep + 1} of {article.comprehension.length}</p>
            <div className="flex gap-1">
              {article.comprehension.map((_, i) => (
                <div key={i} className={cn('w-2 h-2 rounded-full', i < compStep ? 'bg-primary' : i === compStep ? 'bg-primary' : 'bg-gray-200')} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <p className="text-base font-semibold text-gray-900 mb-4">{currentQ.question}</p>
            <div className="space-y-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selected === idx;
                const isCorrect = currentQ.correct === idx;
                const showFeedback = showResult;

                let optClass = 'border-gray-200 bg-white text-gray-700 hover:border-primary cursor-pointer';
                if (showFeedback && isCorrect) optClass = 'border-success bg-green-50 text-green-800';
                else if (showFeedback && isSelected && !isCorrect) optClass = 'border-error bg-red-50 text-red-800';
                else if (isSelected && !showFeedback) optClass = 'border-primary bg-primary-bg text-primary';

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
            <Button fullWidth size="lg" loading={loading} onClick={handleNext}>
              {compStep + 1 < article.comprehension.length ? 'Next question →' : 'Finish'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
