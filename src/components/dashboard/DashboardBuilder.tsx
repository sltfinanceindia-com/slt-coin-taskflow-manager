import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { 
  LayoutGrid, 
  Plus, 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings2, 
  Save,
  BarChart3,
  CheckSquare,
  Clock,
  Coins,
  Target,
  Calendar,
  MessageCircle,
  Users,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  widget_type: string;
  title: string;
  position: number;
  size: 'small' | 'medium' | 'large';
  is_visible: boolean;
  config: Record<string, unknown>;
}

const AVAILABLE_WIDGETS = [
  { type: 'stats_overview', title: 'Stats Overview', icon: BarChart3, description: 'Key metrics at a glance' },
  { type: 'my_tasks', title: 'My Tasks', icon: CheckSquare, description: 'Your assigned tasks' },
  { type: 'time_tracker', title: 'Time Tracker', icon: Clock, description: 'Track working hours' },
  { type: 'coin_balance', title: 'Coin Balance', icon: Coins, description: 'Your coin earnings' },
  { type: 'goals_progress', title: 'Goals Progress', icon: Target, description: 'Personal goal tracking' },
  { type: 'upcoming_events', title: 'Upcoming Events', icon: Calendar, description: 'Calendar events' },
  { type: 'pulse_survey', title: 'Pulse Survey', icon: MessageCircle, description: 'Quick feedback surveys' },
  { type: 'team_activity', title: 'Team Activity', icon: Users, description: 'Recent team updates' },
  { type: 'performance_chart', title: 'Performance', icon: TrendingUp, description: 'Performance metrics' },
  { type: 'recent_activity', title: 'Recent Activity', icon: Activity, description: 'Activity feed' },
];

export function DashboardBuilder() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch user's widgets
  const { data: widgets = [], isLoading } = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('user_id', profile?.id)
        .order('position');

      if (error) throw error;
      
      return (data || []) as DashboardWidget[];
    },
    enabled: !!profile?.id,
  });

  // Initialize local state when widgets load or create defaults
  useEffect(() => {
    if (widgets.length > 0) {
      setLocalWidgets(widgets);
    } else if (!isLoading && profile?.id) {
      // Create default widgets for new users
      const defaultWidgets: DashboardWidget[] = [
        { id: 'default-1', widget_type: 'stats_overview', title: 'Stats Overview', position: 0, size: 'large', is_visible: true, config: {} },
        { id: 'default-2', widget_type: 'my_tasks', title: 'My Tasks', position: 1, size: 'medium', is_visible: true, config: {} },
        { id: 'default-3', widget_type: 'goals_progress', title: 'Goals Progress', position: 2, size: 'medium', is_visible: true, config: {} },
        { id: 'default-4', widget_type: 'coin_balance', title: 'Coin Balance', position: 3, size: 'small', is_visible: true, config: {} },
      ];
      setLocalWidgets(defaultWidgets);
    }
  }, [widgets, isLoading, profile?.id]);

  // Save widgets mutation
  const saveWidgets = useMutation({
    mutationFn: async () => {
      for (const widget of localWidgets) {
        const { error } = await supabase
          .from('dashboard_widgets')
          .update({
            position: widget.position,
            is_visible: widget.is_visible,
            size: widget.size,
          })
          .eq('id', widget.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
      toast.success('Dashboard layout saved!');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save layout');
    },
  });

  // Add widget mutation - with duplicate check
  const addWidget = useMutation({
    mutationFn: async (widgetType: string) => {
      // Check for duplicates before adding
      const existingTypes = localWidgets.map(w => w.widget_type);
      if (existingTypes.includes(widgetType)) {
        throw new Error('This widget is already on your dashboard');
      }

      const widgetInfo = AVAILABLE_WIDGETS.find(w => w.type === widgetType);
      if (!widgetInfo) throw new Error('Widget not found');

      const { error } = await supabase.from('dashboard_widgets').insert({
        user_id: profile?.id,
        widget_type: widgetType,
        title: widgetInfo.title,
        position: localWidgets.length,
        size: 'medium',
        is_visible: true,
        config: {},
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
      toast.success('Widget added!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    setLocalWidgets(updatedItems);
    setHasChanges(true);
  }, [localWidgets]);

  const toggleVisibility = (id: string) => {
    setLocalWidgets(prev =>
      prev.map(w => w.id === id ? { ...w, is_visible: !w.is_visible } : w)
    );
    setHasChanges(true);
  };

  const activeWidgetTypes = localWidgets.map(w => w.widget_type);
  const availableToAdd = AVAILABLE_WIDGETS.filter(w => !activeWidgetTypes.includes(w.type));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Customize Dashboard
          </SheetTitle>
          <SheetDescription>
            Drag to reorder widgets and toggle visibility
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Active Widgets */}
          <div>
            <h3 className="text-sm font-medium mb-3">Active Widgets</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="widgets">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {(localWidgets.length > 0 ? localWidgets : widgets).map((widget, index) => {
                      const widgetInfo = AVAILABLE_WIDGETS.find(w => w.type === widget.widget_type);
                      const Icon = widgetInfo?.icon || LayoutGrid;
                      return (
                        <Draggable key={widget.id} draggableId={widget.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab text-muted-foreground"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <Icon className="h-5 w-5 text-primary" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{widget.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {widgetInfo?.description}
                                </p>
                              </div>
                              <Switch
                                checked={widget.is_visible}
                                onCheckedChange={() => toggleVisibility(widget.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Available Widgets - responsive grid */}
          {availableToAdd.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Add Widgets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableToAdd.map((widget) => {
                  const Icon = widget.icon;
                  return (
                    <button
                      key={widget.type}
                      onClick={() => addWidget.mutate(widget.type)}
                      disabled={addWidget.isPending}
                      className="flex items-center gap-2 p-3 rounded-lg border border-dashed hover:border-primary hover:bg-primary/5 transition-colors text-left disabled:opacity-50"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{widget.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save Button */}
          {hasChanges && (
            <Button 
              className="w-full gap-2" 
              onClick={() => saveWidgets.mutate()}
              disabled={saveWidgets.isPending}
            >
              <Save className="h-4 w-4" />
              {saveWidgets.isPending ? 'Saving...' : 'Save Layout'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
