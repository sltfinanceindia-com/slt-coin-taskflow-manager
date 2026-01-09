/**
 * Tasks Tab Component
 * Task management with Kanban board
 */

import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTasks } from '@/hooks/useTasks';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { TabBasedKanban } from '@/components/kanban/TabBasedKanban';
import { PageHeader } from '@/components/layouts/PageHeader';

export function TasksTab() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { tasks, createTask, updateTaskStatus, verifyTask, updateTask, isCreating, isUpdating } = useTasks();

  const myTasks = tasks.filter(task => 
    isAdmin ? true : task.assigned_to === profile?.id
  );

  if (isAdmin) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Task Management"
          description="Create and manage tasks for your team"
          actions={<CreateTaskDialog onCreateTask={createTask} isCreating={isCreating} />}
        />
        <TabBasedKanban
          tasks={myTasks}
          onUpdateStatus={updateTaskStatus}
          onVerifyTask={verifyTask}
          onUpdateTask={updateTask}
          isUpdating={isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="My Tasks"
        description="View and manage your assigned tasks"
      />
      <TabBasedKanban
        tasks={myTasks}
        onUpdateStatus={updateTaskStatus}
        onVerifyTask={verifyTask}
        onUpdateTask={updateTask}
        isUpdating={isUpdating}
      />
    </div>
  );
}
