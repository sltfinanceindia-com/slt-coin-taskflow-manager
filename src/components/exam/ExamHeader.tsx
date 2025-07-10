import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';

interface ExamHeaderProps {
  examTitle: string;
  timeLeft: number | null;
  formatTime: (seconds: number) => string;
  onSubmitClick: () => void;
  isSubmitting: boolean;
}

export function ExamHeader({ 
  examTitle, 
  timeLeft, 
  formatTime, 
  onSubmitClick, 
  isSubmitting 
}: ExamHeaderProps) {
  return (
    <DialogHeader className="p-4 border-b">
      <DialogTitle className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
        <span className="text-lg md:text-xl font-semibold">{examTitle}</span>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 md:h-5 md:w-5" />
            <span className={`font-mono text-sm md:text-lg ${timeLeft && timeLeft < 300 ? 'text-red-500' : ''}`}>
              {timeLeft ? formatTime(timeLeft) : '00:00'}
            </span>
          </div>
          <Button 
            onClick={onSubmitClick}
            variant="outline"
            disabled={isSubmitting}
            className="w-full md:w-auto"
            size="sm"
          >
            Submit Exam
          </Button>
        </div>
      </DialogTitle>
    </DialogHeader>
  );
}