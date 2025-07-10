
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UIUXExam {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  is_active: boolean;
  questions?: ExamQuestion[];
}

export interface UIUXExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  is_passed: boolean | null;
  completed_at: string | null;
  started_at: string;
  time_taken_minutes: number | null;
}

interface ExamQuestion {
  id: string;
  question_number: number;
  question_text: string;
  options: ExamOption[];
}

interface ExamOption {
  id: string;
  option_number: number;
  option_text: string;
  is_correct: boolean;
}

interface ExamAttempt {
  id: string;
  score: number;
  total_questions: number;
  is_passed: boolean;
  completed_at: string | null;
  time_taken_minutes: number | null;
}

export const useUIUXExams = () => {
  const [exams, setExams] = useState<UIUXExam[]>([]);
  const [attempts, setAttempts] = useState<UIUXExamAttempt[]>([]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [examWithQuestions, setExamWithQuestions] = useState<UIUXExam | null>(null);
  const { toast } = useToast();

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      
      const { data: examsData, error } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exams:', error);
        return;
      }

      setExams(examsData || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserAttempts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: attemptsData, error } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching attempts:', error);
        return;
      }

      setAttempts(attemptsData || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const fetchExamQuestions = async () => {
    try {
      setLoading(true);
      
      // Get active exam
      const { data: exam, error: examError } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('is_active', true)
        .single();

      if (examError || !exam) {
        throw new Error('No active exam found');
      }

      // Get questions with options
      const { data: questionsData, error: questionsError } = await supabase
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
        .order('question_number');

      if (questionsError) {
        throw new Error('Failed to fetch questions');
      }

      // Transform the data
      const formattedQuestions: ExamQuestion[] = questionsData.map(q => ({
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        options: (q.question_options || [])
          .sort((a, b) => a.option_number - b.option_number)
          .map(opt => ({
            id: opt.id,
            option_number: opt.option_number,
            option_text: opt.option_text,
            is_correct: opt.is_correct
          }))
      }));

      setQuestions(formattedQuestions);
      setTimeRemaining(exam.time_limit_minutes * 60); // Convert to seconds
      
      // Set exam with questions for the popup
      setExamWithQuestions({
        ...exam,
        questions: formattedQuestions
      });
      
      console.log('Loaded questions:', formattedQuestions.length);
      
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      toast({
        title: "Error",
        description: "Failed to load exam questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (examId: string) => {
    try {
      setIsStarting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Get exam details
      const { data: exam } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (!exam) throw new Error('Exam not found');

      // Create exam attempt
      const { data: attempt, error } = await supabase
        .from('ui_ux_exam_attempts')
        .insert({
          exam_id: examId,
          user_id: profile.id,
          total_questions: exam.total_questions,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentAttempt(attempt);
      setExamStartTime(new Date());
      
      // Refresh attempts list
      await fetchUserAttempts();
      
      console.log('Exam started, attempt ID:', attempt.id);

    } catch (error) {
      console.error('Error starting exam:', error);
      toast({
        title: "Error",
        description: "Failed to start exam",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const submitAnswer = (questionId: string, optionNumber: number) => {
    console.log('Submitting answer:', { questionId, optionNumber });
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionNumber
    }));
  };

  const submitExam = async (data: { attemptId: string; answers: { [key: number]: number } }) => {
    try {
      setIsSubmitting(true);
      
      const { attemptId, answers: examAnswers } = data;
      
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
      console.log('Total questions:', totalQuestions);
      console.log('User answers:', examAnswers);

      // Insert user answers and calculate score
      for (const question of questions) {
        const questionIndex = question.question_number - 1; // Convert to 0-based index
        const userAnswer = examAnswers[questionIndex];
        
        if (userAnswer !== undefined) {
          // Find the correct option for this question
          const correctOption = question.options.find(opt => opt.is_correct);
          const selectedOption = question.options.find(opt => opt.option_number === (userAnswer + 1)); // Convert back to 1-based
          
          const isCorrect = correctOption && selectedOption && correctOption.id === selectedOption.id;
          
          if (isCorrect) {
            correctAnswers++;
          }

          console.log(`Question ${question.question_number}:`, {
            userAnswer,
            correctOptionNumber: correctOption?.option_number,
            selectedOptionId: selectedOption?.id,
            correctOptionId: correctOption?.id,
            isCorrect
          });

          // Insert user answer
          await supabase
            .from('user_answers')
            .insert({
              attempt_id: attemptId,
              question_id: question.id,
              selected_option_id: selectedOption?.id || null,
              is_correct: isCorrect
            });
        }
      }

      const isPassed = correctAnswers >= Math.ceil(totalQuestions * 0.7); // 70% passing score

      console.log('Final score calculation:', {
        correctAnswers,
        totalQuestions,
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

      if (updateError) throw updateError;

      // Update current attempt state
      setCurrentAttempt(prev => prev ? {
        ...prev,
        score: correctAnswers,
        is_passed: isPassed,
        completed_at: new Date().toISOString(),
        time_taken_minutes: timeTaken
      } : null);

      // Refresh attempts list
      await fetchUserAttempts();

      const percentage = Math.round((correctAnswers / totalQuestions) * 100);

      toast({
        title: isPassed ? "Congratulations!" : "Exam Complete",
        description: `You scored ${percentage}% (${correctAnswers}/${totalQuestions} correct). ${isPassed ? 'You passed!' : 'You need 70% to pass.'}`,
        variant: isPassed ? "default" : "destructive",
      });

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

  const getUserAttempt = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: attempt } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (attempt) {
        setCurrentAttempt(attempt);
      }
    } catch (error) {
      console.error('Error fetching user attempt:', error);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchUserAttempts();
    fetchExamQuestions();
    getUserAttempt();
  }, []);

  // Timer effect
  useEffect(() => {
    if (currentAttempt && !currentAttempt.completed_at && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitExam({ 
              attemptId: currentAttempt.id, 
              answers: Object.keys(answers).reduce((acc, key) => {
                acc[parseInt(key)] = answers[key];
                return acc;
              }, {} as { [key: number]: number })
            }); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentAttempt, timeRemaining]);

  return {
    exams,
    attempts,
    questions,
    examWithQuestions,
    currentAttempt,
    answers,
    loading,
    isLoading,
    isStarting,
    isSubmitting,
    timeRemaining,
    startExam,
    submitAnswer,
    submitExam,
    fetchExamQuestions,
  };
};
