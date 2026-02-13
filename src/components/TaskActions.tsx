
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CheckCircle, AlertTriangle, XCircle, Send } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface TaskActionsProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: Task['status'], submissionNotes?: string) => void;
  onVerifyTask: (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => void;
}

export function TaskActions({ task, onUpdateStatus, onVerifyTask }: TaskActionsProps) {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const isAssignedToMe = task.assigned_to === profile?.id;

  const handleStartTask = () => {
    onUpdateStatus(task.id, 'in_progress');
  };

  const handleCompleteTask = () => {
    if (submissionNotes.trim()) {
      onUpdateStatus(task.id, 'completed', submissionNotes);
      setSubmissionNotes('');
      setShowSubmissionForm(false);
    }
  };

  const handleVerifyTask = (approve: boolean) => {
    onVerifyTask(task.id, approve, adminFeedback, task.slt_coin_value);
    setAdminFeedback('');
    setShowVerificationForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Employee Actions */}
      {isAssignedToMe && task.status === 'assigned' && (
        <Button 
          onClick={handleStartTask} 
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Clock className="h-4 w-4 mr-2" />
          Start Task
        </Button>
      )}

      {isAssignedToMe && task.status === 'in_progress' && (
        <div className="space-y-3">
          {!showSubmissionForm ? (
            <Button 
              onClick={() => setShowSubmissionForm(true)} 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-gradient-to-br from-green-50/50 to-green-50/30 dark:from-green-950/20 dark:to-green-950/10 rounded-lg border border-green-200/50 dark:border-green-800/30 animate-fade-in">
              <Textarea
                placeholder="Describe what you accomplished and any challenges faced..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={4}
                className="resize-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleCompleteTask}
                  disabled={!submissionNotes.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Task
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSubmissionForm(false);
                    setSubmissionNotes('');
                  }}
                  className="hover:bg-muted/50 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && task.status === 'completed' && (
        <div className="space-y-3">
          {!showVerificationForm ? (
            <Button 
              onClick={() => setShowVerificationForm(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Review Task
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-lg border border-orange-200/50 animate-fade-in">
              <Textarea
                placeholder="Provide feedback for the task completion..."
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                rows={3}
                className="resize-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleVerifyTask(true)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Award Coins
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleVerifyTask(false)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowVerificationForm(false);
                  setAdminFeedback('');
                }}
                className="w-full hover:bg-muted/50 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
