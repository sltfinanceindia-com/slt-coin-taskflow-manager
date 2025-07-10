import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answers: { [key: number]: number };
  onQuestionSelect: (index: number) => void;
}

export function QuestionNavigation({ 
  totalQuestions, 
  currentQuestionIndex, 
  answers, 
  onQuestionSelect 
}: QuestionNavigationProps) {
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="text-sm">Question Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {questionNumbers.map((index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : answers[index] !== undefined ? "secondary" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onQuestionSelect(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted">
            <span className="text-sm font-medium">Question Navigation</span>
            <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-2 grid grid-cols-5 gap-2 border rounded-lg p-3">
            {questionNumbers.map((index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : answers[index] !== undefined ? "secondary" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onQuestionSelect(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}