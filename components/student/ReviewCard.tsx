'use client';

import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onDispute?: (review: Review) => void;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="inline-flex gap-0.5" style={{ fontSize: size }}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} className="text-amber-400">★</span>
      ))}
      {hasHalfStar && <span className="text-amber-400 opacity-50">★</span>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-200">★</span>
      ))}
    </span>
  );
}

function RatingRow({ label, rating }: { label: string; rating: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-1.5">
        <StarRating rating={rating} size={12} />
        <span className="text-xs font-medium text-gray-800 w-7 text-right">{rating.toFixed(1)}</span>
      </div>
    </div>
  );
}

export function ReviewCard({ review, onDispute }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Card padding="md" className="mb-3">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar src={review.business?.logo_url} name={review.business?.business_name || 'Business'} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{review.business?.business_name || 'Business'}</p>
            {review.job && <p className="text-xs text-text-secondary truncate">{review.job.title}</p>}
          </div>
        </div>
        <span className="text-xs text-text-secondary flex-shrink-0">{formatDate(review.created_at)}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StarRating rating={review.rating} size={18} />
        <span className="text-base font-bold text-gray-900">{review.rating.toFixed(1)}</span>
      </div>

      <div className="space-y-1 mb-3 pb-3 border-b border-gray-100">
        <RatingRow label="Reliability" rating={review.reliability_rating} />
        <RatingRow label="Communication" rating={review.communication_rating} />
        <RatingRow label="Work quality" rating={review.work_quality_rating} />
      </div>

      {review.comment && (
        <p className="text-sm text-gray-700 italic leading-relaxed mb-3">&ldquo;{review.comment}&rdquo;</p>
      )}

      {review.endorsed_skills && review.endorsed_skills.length > 0 && (
        <div className="mb-1">
          <p className="text-xs text-text-secondary mb-1.5">Endorsed skills:</p>
          <div className="flex flex-wrap gap-1.5">
            {review.endorsed_skills.map((skill) => (
              <Badge key={skill} variant="primary">{skill}</Badge>
            ))}
          </div>
        </div>
      )}

      {onDispute && (
        <button
          onClick={() => onDispute(review)}
          className="w-full text-center text-xs text-text-secondary underline mt-3 pt-3 border-t border-gray-100 hover:text-gray-700"
        >
          Dispute this review
        </button>
      )}
    </Card>
  );
}
