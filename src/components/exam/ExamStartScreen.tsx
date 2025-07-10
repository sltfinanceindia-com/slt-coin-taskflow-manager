
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, Target, AlertCircle } from 'lucide-react';
import { ExamData, ExamAttempt } from '@/hooks/useUIUXExams';

interface ExamStartScreenProps {
  exam: ExamData;
  attempts: ExamAttempt[];
  onStartExam: (examId: string) => void;
  isStartingExam: boolean;
}

export function ExamStartScreen({ 
  exam, 
  attempts, 
  onStartExam, 
  isStartingExam 
}: ExamStartScreenProps) {
  const hasAttempted = attempts.length > 0;
  const latestAttempt = attempts[0];
  const hasActiveAttempt = latestAttempt && !latestAttempt.completed_at;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{exam.title}</CardTitle>
          {exam.description && (
            <p className="text-muted-foreground">{exam.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{exam.total_questions}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{exam.time_limit_minutes} mins</p>
                <p className="text-sm text-muted-foreground">Time Limit</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">{exam.passing_score}%</p>
                <p className="text-sm text-muted-foreground">Passing Score</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Instructions:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You have {exam.time_limit_minutes} minutes to complete all {exam.total_questions} questions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Each question has 4 multiple choice options</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You can navigate between questions using the navigation panel</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Your answers are automatically saved as you progress</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You need to score at least {exam.passing_score}% to pass</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>The exam will auto-submit when time runs out</span>
              </li>
            </ul>
          </div>

          {/* Previous Attempts */}
          {hasAttempted && (
            <div className="space-y-4">
              <h3 className="font-semibold">Previous Attempts:</h3>
              <div className="space-y-2">
                {attempts.slice(0, 3).map((attempt, index) => (
                  <div key={attempt.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Attempt {attempts.length - index}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(attempt.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {attempt.completed_at ? (
                        <>
                          <p className={`font-medium ${attempt.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.score}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {attempt.is_passed ? 'Passed' : 'Failed'}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-yellow-600">In Progress</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning for active attempt */}
          {hasActiveAttempt && (
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Active Attempt Detected</p>
                <p className="text-sm text-yellow-700">
                  You have an ongoing exam attempt. You can only have one active attempt at a time.
                </p>
              </div>
            </div>
          )}

          {/* Start Button */}
          <Button
            onClick={() => onStartExam(exam.id)}
            disabled={isStartingExam || hasActiveAttempt}
            className="w-full"
            size="lg"
          >
            {isStartingExam ? 'Starting Exam...' : hasActiveAttempt ? 'Resume Exam' : 'Start Exam'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
