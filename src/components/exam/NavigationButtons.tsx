import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function NavigationButtons({ 
  currentQuestionIndex, 
  totalQuestions, 
  onPrevious, 
  onNext 
}: NavigationButtonsProps) {
  return (
    <div className="flex flex-col space-y-2 pt-4 md:flex-row md:justify-between md:space-y-0">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        className="w-full md:w-auto"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <Button
        onClick={onNext}
        disabled={currentQuestionIndex === totalQuestions - 1}
        className="w-full md:w-auto"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}