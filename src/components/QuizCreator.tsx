
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUIUXExams } from '@/hooks/useUIUXExams';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Question {
  question_text: string;
  options: string[];
  correct_answer: number;
}

export function QuizCreator() {
  const { profile } = useAuth();
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(90);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0
  });

  const addQuestion = () => {
    if (currentQuestion.question_text && currentQuestion.options.every(opt => opt.trim())) {
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0
      });
    }
  };

  const createExam = async () => {
    if (!profile?.id || !examTitle || questions.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one question.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create exam
      const { data: exam, error: examError } = await supabase
        .from('ui_ux_exams')
        .insert({
          title: examTitle,
          description: examDescription,
          time_limit_minutes: timeLimit,
          total_questions: questions.length,
          is_active: true
        })
        .select()
        .single();

      if (examError) throw examError;

      // Create questions and options
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        const { data: questionData, error: questionError } = await supabase
          .from('exam_questions')
          .insert({
            exam_id: exam.id,
            question_number: i + 1,
            question_text: question.question_text
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Create options
        for (let j = 0; j < question.options.length; j++) {
          await supabase
            .from('question_options')
            .insert({
              question_id: questionData.id,
              option_number: j,
              option_text: question.options[j],
              is_correct: j === question.correct_answer
            });
        }
      }

      toast({
        title: "Success",
        description: "Exam created successfully!",
      });

      // Reset form
      setExamTitle('');
      setExamDescription('');
      setTimeLimit(90);
      setQuestions([]);
      setCurrentQuestion({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0
      });

    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create UI/UX Exam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Exam Title</Label>
            <Input
              id="title"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Enter exam title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={examDescription}
              onChange={(e) => setExamDescription(e.target.value)}
              placeholder="Enter exam description"
            />
          </div>

          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              min="1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={currentQuestion.question_text}
              onChange={(e) => setCurrentQuestion({
                ...currentQuestion,
                question_text: e.target.value
              })}
              placeholder="Enter question"
            />
          </div>

          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name="correct"
                checked={currentQuestion.correct_answer === index}
                onChange={() => setCurrentQuestion({
                  ...currentQuestion,
                  correct_answer: index
                })}
              />
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...currentQuestion.options];
                  newOptions[index] = e.target.value;
                  setCurrentQuestion({
                    ...currentQuestion,
                    options: newOptions
                  });
                }}
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}

          <Button onClick={addQuestion}>Add Question</Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions Added: {questions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={createExam} className="w-full">
              Create Exam
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
