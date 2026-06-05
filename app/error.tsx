'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gray-50">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-text-secondary mb-8 max-w-xs">An unexpected error occurred. Try refreshing, or contact support if the problem persists.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Try again
        </button>
        <a href="/" className="text-sm font-medium text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-bg transition-colors">
          Go home
        </a>
      </div>
    </div>
  );
}
