
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { TaskCard } from '@/components/TaskCard';
import { Card } from '@/components/ui/card';
import { Clipboard } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

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
            <EmptyState
              icon={Clipboard}
              title="No tasks assigned yet"
              description="Your assigned tasks will appear here. Check back soon!"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
