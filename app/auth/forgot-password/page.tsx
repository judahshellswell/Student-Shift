'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/providers/ToastProvider';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showError } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch {
      showError('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-primary">Student</span><span className="text-secondary">Shift</span>
          </Link>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">Reset your password</h2>
        </div>

        {sent ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Check your email</h3>
            <p className="text-sm text-text-secondary">We sent a reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.</p>
            <Link href="/auth/login" className="text-sm text-primary hover:underline mt-4 block">← Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <p className="text-sm text-text-secondary">Enter your email and we&apos;ll send you a reset link.</p>
            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
            <Button type="submit" fullWidth size="lg" loading={loading}>Send reset link</Button>
            <Link href="/auth/login" className="text-sm text-primary hover:underline block text-center">← Back to sign in</Link>
          </form>
        )}
      </div>
    </div>
  );
}
