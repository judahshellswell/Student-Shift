'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, maxLength, className, id, value, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            error ? 'border-error' : 'border-gray-300 hover:border-gray-400',
            className
          )}
          {...props}
        />
        <div className="flex justify-between">
          {error ? <p className="text-xs text-error">{error}</p> : hint ? <p className="text-xs text-text-secondary">{hint}</p> : <span />}
          {showCount && maxLength && (
            <p className={cn('text-xs', charCount > maxLength * 0.9 ? 'text-warning' : 'text-text-secondary')}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export { Textarea };
