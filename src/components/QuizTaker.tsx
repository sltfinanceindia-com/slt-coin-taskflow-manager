
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUIUXExams } from '@/hooks/useUIUXExams';
import { UIUXExamPopup } from '@/components/UIUXExamPopup';
import { useState } from 'react';

export function QuizTaker() {
  const { exams, attempts, startExam, submitExam, isStarting, isSubmitting } = useUIUXExams();
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examPopupOpen, setExamPopupOpen] = useState(false);

  const handleExamClick = (exam: any) => {
    const userAttempt = attempts.find(a => a.exam_id === exam.id);
    
    if (userAttempt?.completed_at) {
      setSelectedExam({ exam, attempt: userAttempt });
      setExamPopupOpen(true);
    } else if (userAttempt && !userAttempt.completed_at) {
      setSelectedExam({ exam, attempt: userAttempt });
      setExamPopupOpen(true);
    } else {
      setSelectedExam({ exam, attempt: null });
      setExamPopupOpen(true);
    }
  };

  const getExamStatus = (examId: string) => {
    const attempt = attempts.find(a => a.exam_id === examId);
    if (!attempt) return 'not_started';
    if (attempt.completed_at) return 'completed';
    return 'in_progress';
  };

  const getExamButtonText = (examId: string) => {
    const status = getExamStatus(examId);
    switch (status) {
      case 'completed': return 'View Results';
      case 'in_progress': return 'Resume Exam';
      default: return 'Start Exam';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available UI/UX Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p>No exams available at the moment.</p>
          ) : (
            <div className="grid gap-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="cursor-pointer hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    {exam.description && <p className="text-sm text-muted-foreground">{exam.description}</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {exam.total_questions} questions • {exam.time_limit_minutes} minutes
                      </div>
                      <Button 
                        onClick={() => handleExamClick(exam)}
                        disabled={getExamStatus(exam.id) === 'completed'}
                      >
                        {getExamButtonText(exam.id)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UIUXExamPopup
        exam={selectedExam?.exam || null}
        attempt={selectedExam?.attempt || null}
        open={examPopupOpen}
        onOpenChange={setExamPopupOpen}
        onStartExam={startExam}
        onSubmitExam={submitExam}
        isStarting={isStarting}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
