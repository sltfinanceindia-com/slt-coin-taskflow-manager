
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

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
  const answeredCount = Object.keys(answers).length;

  const getQuestionStatus = (index: number) => {
    if (answers[index] !== undefined) return 'answered';
    if (index === currentQuestionIndex) return 'current';
    return 'unanswered';
  };

  const getButtonVariant = (status: string) => {
    switch (status) {
      case 'current': return 'default';
      case 'answered': return 'secondary';
      default: return 'outline';
    }
  };

  const getButtonClassName = (status: string) => {
    const base = "h-10 w-10 p-0 text-sm font-semibold transition-all duration-200";
    switch (status) {
      case 'current': 
        return `${base} bg-primary text-primary-foreground shadow-md scale-105`;
      case 'answered': 
        return `${base} bg-green-100 text-green-700 border-green-300 hover:bg-green-200`;
      default: 
        return `${base} hover:bg-muted`;
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden lg:block sticky top-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Questions</span>
            <div className="flex items-center space-x-1 text-sm font-normal">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">{answeredCount}/{totalQuestions}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-5 gap-2">
            {questionNumbers.map((index) => {
              const status = getQuestionStatus(index);
              return (
                <Button
                  key={index}
                  variant={getButtonVariant(status)}
                  className={getButtonClassName(status)}
                  onClick={() => onQuestionSelect(index)}
                  title={`Question ${index + 1} - ${status === 'answered' ? 'Answered' : status === 'current' ? 'Current' : 'Not answered'}`}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-base font-semibold">Question Navigation</span>
              <div className="flex items-center space-x-1 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">{answeredCount}/{totalQuestions}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
          </summary>
          
          <div className="mt-3 grid grid-cols-5 gap-2 border-2 rounded-lg p-4 bg-card">
            {questionNumbers.map((index) => {
              const status = getQuestionStatus(index);
              return (
                <Button
                  key={index}
                  variant={getButtonVariant(status)}
                  className={getButtonClassName(status)}
                  onClick={() => onQuestionSelect(index)}
                >
                  {index + 1}
                </Button>
              );
            })}
            
            <div className="col-span-5 mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Overall Progress</span>
                <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </details>
      </div>
    </>
  );
}
