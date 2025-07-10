
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

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

  const unansweredCount = totalQuestions - answeredQuestions;
  const completionRate = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4">
            {unansweredCount > 0 ? (
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {unansweredCount > 0 ? 'Submit Incomplete Exam?' : 'Submit Complete Exam?'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Status:</span>
              <span className="text-lg font-bold text-primary">{completionRate}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Answered Questions:</span>
              <span className="font-semibold text-green-600">{answeredQuestions}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unanswered Questions:</span>
              <span className={`font-semibold ${unansweredCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {unansweredCount}
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 mt-3">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Warning:</p>
                <p className="text-amber-700">
                  You have {unansweredCount} unanswered questions. These will be marked as incorrect.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Important:</p>
              <p className="text-blue-700">
                Once submitted, you cannot change your answers. Make sure you're ready to finish.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 h-12"
            >
              Review Answers
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 h-12"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Exam'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
