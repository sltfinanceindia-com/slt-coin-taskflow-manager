/**
 * Tasks Tab Component
 * Task management with Kanban board or list view based on URL params
 */

import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTasks } from '@/hooks/useTasks';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { TabBasedKanban } from '@/components/kanban/TabBasedKanban';
import { PageHeader } from '@/components/layouts/PageHeader';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Kanban, List } from 'lucide-react';

export function TasksTab() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { tasks, createTask, updateTaskStatus, verifyTask, updateTask, isCreating, isUpdating } = useTasks();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const view = searchParams.get('view') || 'kanban';

  const myTasks = tasks.filter(task => 
    isAdmin ? true : task.assigned_to === profile?.id
  );

  const handleViewChange = (newView: string) => {
    setSearchParams({ view: newView });
  };

  const ViewToggle = (
    <div className="flex items-center gap-4">
      <Tabs value={view} onValueChange={handleViewChange}>
        <TabsList className="h-9">
          <TabsTrigger value="kanban" className="px-3 gap-1.5">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="px-3 gap-1.5">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {isAdmin && <CreateTaskDialog onCreateTask={createTask} isCreating={isCreating} />}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={isAdmin ? "Task Management" : "My Tasks"}
        description={isAdmin ? "Create and manage tasks for your team" : "View and manage your assigned tasks"}
        actions={ViewToggle}
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
