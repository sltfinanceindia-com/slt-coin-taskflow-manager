import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubmitConfirmDialogProps {
  isOpen: boolean;
  answeredQuestions: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmDialog({ 
  isOpen, 
  answeredQuestions, 
  totalQuestions, 
  isSubmitting, 
  onCancel, 
  onConfirm 
}: SubmitConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Submit Exam?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            You have answered {answeredQuestions} out of {totalQuestions} questions.
            {answeredQuestions < totalQuestions && (
              <span className="text-yellow-600 block mt-2">
                Warning: You have {totalQuestions - answeredQuestions} unanswered questions.
              </span>
            )}
          </p>
          <p className="text-sm">Are you sure you want to submit your exam? This action cannot be undone.</p>
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}