
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { CheckCircle } from 'lucide-react';

export function TaskManager() {
  const { tasks, createTask, updateTaskStatus, verifyTask, updateTask, isCreating, isUpdating } = useTasks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Management</h2>
          <p className="text-muted-foreground">Create and manage tasks for your team</p>
        </div>
        <CreateTaskDialog onCreateTask={createTask} isCreating={isCreating} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tasks.length > 0 ? (
          tasks.map((task) => (
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
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Start by creating tasks for your team members.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
