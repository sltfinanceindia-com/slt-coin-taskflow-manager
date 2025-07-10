
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ExamQuestion {
  id: string;
  question_number: number;
  question_text: string;
  options: ExamOption[];
}

export interface ExamOption {
  id: string;
  option_number: number;
  option_text: string;
  is_correct: boolean;
}

export interface UIUXExam {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  is_active: boolean;
  questions: ExamQuestion[];
}

export interface UIUXExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  time_taken_minutes: number | null;
  is_passed: boolean;
}

export interface UserAnswer {
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
}

export function useUIUXExams() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading: examsLoading, error: examsError } = useQuery({
    queryKey: ['ui-ux-exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: examWithQuestions, isLoading: examQuestionsLoading } = useQuery({
    queryKey: ['exam-with-questions', exams[0]?.id],
    queryFn: async () => {
      if (!exams || exams.length === 0) return null;
      
      const exam = exams[0]; // Get the first active exam
      
      // Fetch questions for this exam
      const { data: questions, error: questionsError } = await supabase
        .from('exam_questions')
        .select(`
          id,
          question_number,
          question_text,
          question_options (
            id,
            option_number,
            option_text,
            is_correct
          )
        `)
        .eq('exam_id', exam.id)
        .order('question_number', { ascending: true });

      if (questionsError) throw questionsError;

      // Transform the data to match our interface
      const transformedQuestions: ExamQuestion[] = questions.map(q => ({
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        options: (q.question_options || []).map((opt: any) => ({
          id: opt.id,
          option_number: opt.option_number,
          option_text: opt.option_text,
          is_correct: opt.is_correct
        })).sort((a: ExamOption, b: ExamOption) => a.option_number - b.option_number)
      }));

      const examData: UIUXExam = {
        ...exam,
        questions: transformedQuestions
      };

      return examData;
    },
    enabled: !!exams && exams.length > 0,
  });

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ['exam-attempts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const startExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      if (!profile?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .insert({
          exam_id: examId,
          user_id: profile.id,
          score: 0,
          total_questions: examWithQuestions?.total_questions || 0,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
      toast({
        title: "Exam Started",
        description: "Your exam has been started. Good luck!",
      });
    },
    onError: (error) => {
      console.error('Error starting exam:', error);
      toast({
        title: "Error",
        description: "Failed to start exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ 
      attemptId, 
      questionId, 
      selectedOptionId 
    }: { 
      attemptId: string; 
      questionId: string; 
      selectedOptionId: string | null; 
    }) => {
      if (!selectedOptionId) return null;

      // Get the correct answer for this question
      const { data: correctOption, error: optionError } = await supabase
        .from('question_options')
        .select('is_correct')
        .eq('id', selectedOptionId)
        .single();

      if (optionError) throw optionError;

      const { data, error } = await supabase
        .from('user_answers')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          selected_option_id: selectedOptionId,
          is_correct: correctOption.is_correct || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const submitExamMutation = useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers 
    }: { 
      attemptId: string; 
      answers: { [key: number]: number }; 
    }) => {
      if (!examWithQuestions?.questions) {
        throw new Error('Exam questions not available');
      }

      console.log('Submitting exam with answers:', answers);
      console.log('Total questions available:', examWithQuestions.questions.length);

      // First, save all the answers to the database
      const answerPromises = Object.entries(answers).map(async ([questionIndex, optionIndex]) => {
        const questionIndexNum = parseInt(questionIndex);
        const question = examWithQuestions.questions[questionIndexNum];
        
        if (!question) {
          console.error(`Question not found for index ${questionIndex}`);
          return null;
        }

        // The optionIndex is 0-based, but we need to find the option by its actual option_number
        const selectedOption = question.options.find(opt => opt.option_number === optionIndex + 1);
        
        if (!selectedOption) {
          console.error(`Option not found for question ${questionIndex}, option index ${optionIndex}`);
          console.log('Available options:', question.options);
          return null;
        }

        console.log(`Question ${question.question_number}: Selected "${selectedOption.option_text}" (correct: ${selectedOption.is_correct})`);

        const { data, error } = await supabase
          .from('user_answers')
          .upsert({
            attempt_id: attemptId,
            question_id: question.id,
            selected_option_id: selectedOption.id,
            is_correct: selectedOption.is_correct,
          }, {
            onConflict: 'attempt_id,question_id'
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving answer:', error);
          throw error;
        }

        return data;
      });

      // Wait for all answers to be saved
      const savedAnswers = await Promise.all(answerPromises);
      const validAnswers = savedAnswers.filter(Boolean);
      console.log('Total valid answers saved:', validAnswers.length);

      // Calculate score directly from the saved answers
      const correctAnswers = validAnswers.filter(answer => answer && answer.is_correct).length;
      const totalQuestions = examWithQuestions.total_questions;
      const score = correctAnswers;
      const percentage = Math.round((score / totalQuestions) * 100);
      const isPassed = percentage >= (examWithQuestions.passing_score || 70);

      console.log(`Final Score: ${correctAnswers}/${totalQuestions} = ${percentage}% (passed: ${isPassed})`);

      // Calculate time taken
      const { data: attempt, error: attemptError } = await supabase
        .from('ui_ux_exam_attempts')
        .select('started_at')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      const startTime = new Date(attempt.started_at);
      const endTime = new Date();
      const timeTakenMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Update the attempt with final results
      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score,
          time_taken_minutes: timeTakenMinutes,
          is_passed: isPassed,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
      const percentage = Math.round((data?.score || 0) / (examWithQuestions?.total_questions || 1) * 100);
      const message = data?.is_passed 
        ? `Congratulations! You passed with ${percentage}%` 
        : `You scored ${percentage}%. You need ${examWithQuestions?.passing_score}% to pass.`;
      
      toast({
        title: data?.is_passed ? "Exam Passed!" : "Exam Completed",
        description: message,
        variant: data?.is_passed ? "default" : "destructive",
      });
    },
    onError: (error) => {
      console.error('Error completing exam:', error);
      toast({
        title: "Error",
        description: "Failed to complete exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    exams,
    examWithQuestions,
    attempts,
    isLoading: examsLoading || examQuestionsLoading || attemptsLoading,
    error: examsError,
    startExam: startExamMutation.mutate,
    isStarting: startExamMutation.isPending,
    submitExam: submitExamMutation.mutate,
    isSubmitting: submitExamMutation.isPending,
    submitAnswer: submitAnswerMutation.mutate,
    isSubmittingAnswer: submitAnswerMutation.isPending,
  };
}
