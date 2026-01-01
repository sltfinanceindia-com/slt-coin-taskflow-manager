import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Sparkles, Wand2, Clock, ListChecks, FileText, Loader2 } from 'lucide-react';

interface AITaskAssistantProps {
  taskTitle: string;
  taskDescription?: string;
  projectContext?: string;
  onDescriptionGenerated?: (description: string) => void;
  onPrioritySuggested?: (priority: 'low' | 'medium' | 'high') => void;
  onTimeEstimated?: (hours: number) => void;
  onSubtasksSuggested?: (subtasks: string[]) => void;
}

export function AITaskAssistant({
  taskTitle,
  taskDescription,
  projectContext,
  onDescriptionGenerated,
  onPrioritySuggested,
  onTimeEstimated,
  onSubtasksSuggested,
}: AITaskAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  const aiMutation = useMutation({
    mutationFn: async ({ action }: { action: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-task-assistant', {
        body: { action, taskTitle, taskDescription, projectContext },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const { result, action } = data;

      switch (action) {
        case 'generate_description':
        case 'improve_description':
          onDescriptionGenerated?.(result);
          toast.success('Description generated!');
          break;
        case 'suggest_priority':
          const priority = result.toLowerCase() as 'low' | 'medium' | 'high';
          if (['low', 'medium', 'high'].includes(priority)) {
            onPrioritySuggested?.(priority);
            toast.success(`Priority suggested: ${priority}`);
          }
          break;
        case 'estimate_time':
          const hours = parseFloat(result);
          if (!isNaN(hours)) {
            onTimeEstimated?.(hours);
            toast.success(`Time estimated: ${hours} hours`);
          }
          break;
        case 'suggest_subtasks':
          try {
            const subtasks = JSON.parse(result);
            if (Array.isArray(subtasks)) {
              onSubtasksSuggested?.(subtasks);
              toast.success('Subtasks suggested!');
            }
          } catch {
            toast.error('Failed to parse subtasks');
          }
          break;
      }
      setIsOpen(false);
    },
    onError: (error) => {
      console.error('AI Assistant error:', error);
      toast.error('AI Assistant failed. Please try again.');
    },
  });

  const actions = [
    {
      id: 'generate_description',
      label: 'Generate Description',
      icon: FileText,
      disabled: !taskTitle,
      show: !taskDescription && onDescriptionGenerated,
    },
    {
      id: 'improve_description',
      label: 'Improve Description',
      icon: Wand2,
      disabled: !taskTitle || !taskDescription,
      show: taskDescription && onDescriptionGenerated,
    },
    {
      id: 'suggest_priority',
      label: 'Suggest Priority',
      icon: Sparkles,
      disabled: !taskTitle,
      show: onPrioritySuggested,
    },
    {
      id: 'estimate_time',
      label: 'Estimate Time',
      icon: Clock,
      disabled: !taskTitle,
      show: onTimeEstimated,
    },
    {
      id: 'suggest_subtasks',
      label: 'Suggest Subtasks',
      icon: ListChecks,
      disabled: !taskTitle,
      show: onSubtasksSuggested,
    },
  ].filter((a) => a.show);

  if (actions.length === 0) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
        >
          <Sparkles className="h-4 w-4" />
          AI Assist
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                disabled={action.disabled || aiMutation.isPending}
                onClick={() => aiMutation.mutate({ action: action.id })}
              >
                {aiMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {action.label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}