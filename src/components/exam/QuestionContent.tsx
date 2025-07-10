import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuestionOption {
  id: string;
  option_text: string;
}

interface Question {
  question_number: number;
  question_text: string;
  options: QuestionOption[];
}

interface QuestionContentProps {
  question: Question;
  currentQuestionIndex: number;
  selectedAnswer: number | undefined;
  onAnswerChange: (optionIndex: number) => void;
}

export function QuestionContent({ 
  question, 
  currentQuestionIndex, 
  selectedAnswer, 
  onAnswerChange 
}: QuestionContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Question {question.question_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed">{question.question_text}</p>
        
        <RadioGroup
          value={selectedAnswer?.toString() || ''}
          onValueChange={(value) => onAnswerChange(parseInt(value))}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-0.5" />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm md:text-base leading-relaxed">
                {option.option_text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}