import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Coins, Clock, User, Calendar, AlertCircle, CheckCircle, XCircle, Edit, Eye } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { format } from 'date-fns';
import { TaskComments } from '@/components/TaskComments';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { TaskDetailDialog } from '@/components/TaskDetailDialog';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: Task['status'], submissionNotes?: string) => void;
  onVerifyTask: (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  isUpdating?: boolean;
}

export function TaskCard({ task, onUpdateStatus, onVerifyTask, onUpdateTask, isUpdating }: TaskCardProps) {
  const { profile } = useAuth();
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const isAssignedToMe = task.assigned_to === profile?.id;
  const isCreatedByMe = task.created_by === profile?.id;
  const isAdmin = profile?.role === 'admin';

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <Card className="hover:shadow-md transition-shadow animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 text-coin-gold">
              <Coins className="h-5 w-5" />
              <span className="font-bold">{task.slt_coin_value}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <TaskDetailDialog task={task} />
                {onUpdateTask && (
                  <TaskEditDialog 
                    task={task} 
                    onUpdateTask={onUpdateTask} 
                    isUpdating={isUpdating || false} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        <CardDescription className="text-sm">
          {task.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Assigned to: {task.assigned_profile?.full_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Due: {format(new Date(task.end_date), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Submission Notes */}
        {task.submission_notes && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-1">Submission Notes:</p>
            <p className="text-sm">{task.submission_notes}</p>
          </div>
        )}

        {/* Admin Feedback */}
        {task.admin_feedback && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-1">Admin Feedback:</p>
            <p className="text-sm">{task.admin_feedback}</p>
          </div>
        )}

        {/* Intern Actions */}
        {isAssignedToMe && task.status === 'assigned' && (
          <Button onClick={handleStartTask} className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            Start Task
          </Button>
        )}

        {isAssignedToMe && task.status === 'in_progress' && (
          <div className="space-y-3">
            {!showSubmissionForm ? (
              <Button 
                onClick={() => setShowSubmissionForm(true)} 
                className="w-full"
                variant="secondary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Add submission notes (required)..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCompleteTask}
                    disabled={!submissionNotes.trim()}
                    className="flex-1"
                  >
                    Submit Task
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowSubmissionForm(false);
                      setSubmissionNotes('');
                    }}
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
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowVerificationForm(true)}
                  className="flex-1"
                  variant="secondary"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Review Task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Add feedback (optional)..."
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleVerifyTask(true)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Award Coins
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleVerifyTask(false)}
                    className="flex-1"
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
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {task.status === 'completed' && isAssignedToMe && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⏳ Task submitted and awaiting admin approval for SLT Coins
            </p>
          </div>
        )}

        {task.status === 'verified' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">
              ✅ Task approved! {task.slt_coin_value} SLT Coins awarded
            </p>
          </div>
        )}

        {task.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              ❌ Task rejected. Please review feedback and resubmit if needed.
            </p>
          </div>
        )}

        {/* Task Comments */}
        <div className="mt-4">
          <TaskComments taskId={task.id} />
        </div>
      </CardContent>
    </Card>
  );
}