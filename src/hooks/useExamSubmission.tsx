
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExamQuestion } from '@/types/exam';
import { useToast } from '@/hooks/use-toast';

export const useExamSubmission = (questions: ExamQuestion[]) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitExam = async (data: { attemptId: string; answers: { [key: number]: number } }) => {
    try {
      setIsSubmitting(true);
      
      const { attemptId, answers: examAnswers } = data;
      
      console.log('Starting exam submission with data:', { attemptId, examAnswers });
      console.log('Questions available:', questions.length);
      console.log('Total answers received:', Object.keys(examAnswers).length);

      // Get the attempt
      const { data: attempt } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (!attempt) throw new Error('Attempt not found');

      const timeTaken = Math.floor((new Date().getTime() - new Date(attempt.started_at).getTime()) / (1000 * 60));
      
      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = questions.length;

      console.log('Calculating score...');

      // Clear any existing answers for this attempt
      await supabase
        .from('user_answers')
        .delete()
        .eq('attempt_id', attemptId);

      // Process each question
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswerIndex = examAnswers[i];
        
        console.log(`Processing question ${i + 1}:`, {
          questionIndex: i,
          userAnswerIndex,
          hasAnswer: userAnswerIndex !== undefined && userAnswerIndex !== null
        });

        if (userAnswerIndex !== undefined && userAnswerIndex !== null) {
          const selectedOption = question.options[userAnswerIndex];
          
          if (selectedOption) {
            const isCorrect = selectedOption.is_correct || false;
            
            if (isCorrect) {
              correctAnswers++;
            }

            // Insert user answer into database
            const { error: answerError } = await supabase
              .from('user_answers')
              .insert({
                attempt_id: attemptId,
                question_id: question.id,
                selected_option_id: selectedOption.id,
                is_correct: isCorrect
              });

            if (answerError) {
              console.error(`Error inserting answer for question ${i + 1}:`, answerError);
            }
          }
        }
      }

      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      const isPassed = percentage >= 70;

      console.log('Final score calculation:', {
        correctAnswers,
        totalQuestions,
        percentage,
        isPassed
      });

      // Update exam attempt
      const { error: updateError } = await supabase
        .from('ui_ux_exam_attempts')
        .update({
          score: correctAnswers,
          completed_at: new Date().toISOString(),
          time_taken_minutes: timeTaken,
          is_passed: isPassed
        })
        .eq('id', attemptId);

      if (updateError) {
        console.error('Error updating exam attempt:', updateError);
        throw updateError;
      }

      toast({
        title: isPassed ? "Congratulations!" : "Exam Complete",
        description: `You scored ${percentage}% (${correctAnswers}/${totalQuestions} correct). ${isPassed ? 'You passed!' : 'You need 70% to pass.'}`,
        variant: isPassed ? "default" : "destructive",
      });

      return {
        score: correctAnswers,
        is_passed: isPassed,
        completed_at: new Date().toISOString(),
        time_taken_minutes: timeTaken
      };

    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitExam,
    isSubmitting
  };
};
