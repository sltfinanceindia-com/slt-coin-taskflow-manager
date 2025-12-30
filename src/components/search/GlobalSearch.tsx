import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Search, CheckSquare, FolderKanban, Users, Settings, LayoutDashboard, Calendar, FileText, Plus } from 'lucide-react';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { projects } = useProjects();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tasks, projects, or navigate..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => navigate('/admin'))}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin?tab=projects'))}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Create New Project
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/admin'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin?tab=tasks'))}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Tasks
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin?tab=projects'))}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Projects
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin?tab=interns'))}>
              <Users className="mr-2 h-4 w-4" />
              Team Members
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/admin?tab=calendar'))}>
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>

          {tasks.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent Tasks">
                {tasks.slice(0, 5).map((task) => (
                  <CommandItem
                    key={task.id}
                    onSelect={() => runCommand(() => navigate('/admin?tab=tasks'))}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <span className="truncate">{task.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {task.status.replace('_', ' ')}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {projects.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projects">
                {projects.slice(0, 5).map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => runCommand(() => navigate('/admin?tab=projects'))}
                  >
                    <FolderKanban className="mr-2 h-4 w-4" />
                    <span className="truncate">{project.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
