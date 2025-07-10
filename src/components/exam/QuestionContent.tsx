
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
  const getOptionLabel = (index: number) => String.fromCharCode(65 + index); // A, B, C, D

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl md:text-2xl font-bold text-primary">
          Question {question.question_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/30 p-4 md:p-6 rounded-lg">
          <p className="text-base md:text-lg leading-relaxed font-medium text-foreground">
            {question.question_text}
          </p>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Select your answer:
          </h4>
          
          <RadioGroup
            value={selectedAnswer?.toString() || ''}
            onValueChange={(value) => {
              const optionIndex = parseInt(value);
              console.log(`User selected option ${getOptionLabel(optionIndex)} for question ${question.question_number}`);
              onAnswerChange(optionIndex);
            }}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div 
                key={option.id} 
                className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer ${
                  selectedAnswer === index 
                    ? 'border-primary bg-primary/10 shadow-sm' 
                    : 'border-border bg-card'
                }`}
              >
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`} 
                  className="mt-1 flex-shrink-0" 
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
                      selectedAnswer === index 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {getOptionLabel(index)}
                    </span>
                    <span className="text-sm md:text-base leading-relaxed pt-1">
                      {option.option_text}
                    </span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
