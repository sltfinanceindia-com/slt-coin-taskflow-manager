
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { TaskCard } from '@/components/TaskCard';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function TaskList() {
  const { tasks, updateTaskStatus, verifyTask, updateTask, isUpdating } = useTasks();
  const { profile } = useAuth();

  const myTasks = tasks.filter(task => task.assigned_to === profile?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Tasks</h2>
        <p className="text-muted-foreground">View and manage your assigned tasks</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myTasks.length > 0 ? (
          myTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateStatus={updateTaskStatus}
              onVerifyTask={verifyTask}
              onUpdateTask={updateTask}
              isUpdating={isUpdating}
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
              <p className="text-muted-foreground text-center max-w-md">
                No tasks have been assigned to you yet. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
