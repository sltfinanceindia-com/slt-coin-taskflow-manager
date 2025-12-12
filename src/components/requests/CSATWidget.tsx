import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useSLAMetrics } from '@/hooks/useSLAMetrics';
import { cn } from '@/lib/utils';

interface CSATWidgetProps {
  requestId: string;
  requestTitle?: string;
  onSubmitted?: () => void;
}

export function CSATWidget({ requestId, requestTitle, onSubmitted }: CSATWidgetProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { submitFeedback, isSubmittingFeedback } = useSLAMetrics();

  const handleSubmit = () => {
    if (rating === 0) return;
    
    submitFeedback(
      { requestId, rating, feedbackText: feedback || undefined },
      {
        onSuccess: () => {
          setSubmitted(true);
          onSubmitted?.();
        },
      }
    );
  };

  if (submitted) {
    return (
      <Card className="bg-green-500/5 border-green-500/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-1">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="font-medium text-green-600">Thank you for your feedback!</p>
            <p className="text-sm text-muted-foreground">Your input helps us improve our service.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">How was your experience?</CardTitle>
        {requestTitle && (
          <CardDescription>Rate your experience with: {requestTitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(value)}
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    (hoveredRating || rating) >= value
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              </button>
            ))}
          </div>
          {(hoveredRating || rating) > 0 && (
            <p className="text-center text-sm font-medium text-muted-foreground">
              {ratingLabels[hoveredRating || rating]}
            </p>
          )}
        </div>

        {/* Feedback Text */}
        {rating > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {rating <= 2 ? 'What could we improve?' : 'Any additional comments?'}
            </label>
            <Textarea
              placeholder="Share your thoughts (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmittingFeedback}
          className="w-full"
        >
          {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Inline CSAT for request cards
export function InlineCSATRating({ requestId, onSubmitted }: { requestId: string; onSubmitted?: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { submitFeedback, isSubmittingFeedback } = useSLAMetrics();

  const handleSubmit = (value: number) => {
    setRating(value);
    submitFeedback(
      { requestId, rating: value },
      {
        onSuccess: () => {
          onSubmitted?.();
        },
      }
    );
  };

  if (rating > 0) {
    return (
      <div className="flex items-center gap-1">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        <span className="text-xs text-muted-foreground ml-1">Submitted</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">Rate:</span>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={isSubmittingFeedback}
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
          onMouseEnter={() => setHoveredRating(value)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => handleSubmit(value)}
        >
          <Star
            className={cn(
              'h-4 w-4 transition-colors',
              (hoveredRating) >= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
}
