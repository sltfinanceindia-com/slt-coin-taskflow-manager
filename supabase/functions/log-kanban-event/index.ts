import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KanbanEvent {
  event_type: string;
  task_id: string;
  from_status?: string;
  to_status?: string;
  user_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { event_type, task_id, from_status, to_status, user_id, timestamp, metadata } = await req.json() as KanbanEvent;

    console.log('Logging Kanban event:', { event_type, task_id, from_status, to_status, user_id });

    // Advanced analytics processing
    const analytics = await processAnalytics(supabaseClient, {
      event_type,
      task_id,
      from_status,
      to_status,
      user_id,
      timestamp,
      metadata
    });

    // Log the event for future analysis
    const { error: logError } = await supabaseClient
      .from('kanban_events')
      .insert({
        event_type,
        task_id,
        from_status,
        to_status,
        user_id,
        timestamp,
        metadata: metadata || {},
        analytics_data: analytics
      });

    if (logError) {
      console.error('Error logging kanban event:', logError);
    }

    // Generate insights using advanced algorithms
    const insights = await generateInsights(supabaseClient, user_id);

    // Update real-time metrics
    await updateMetrics(supabaseClient, task_id, event_type);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analytics,
        insights,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in log-kanban-event function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function processAnalytics(supabaseClient: any, event: KanbanEvent) {
  try {
    // Calculate cycle time for status transitions
    let cycleTime = null;
    if (event.from_status && event.to_status) {
      const { data: task } = await supabaseClient
        .from('tasks')
        .select('created_at, updated_at, status')
        .eq('id', event.task_id)
        .single();

      if (task) {
        const startTime = new Date(task.created_at);
        const endTime = new Date(event.timestamp);
        cycleTime = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24); // Days
      }
    }

    // Calculate throughput metrics
    const { data: recentTasks } = await supabaseClient
      .from('tasks')
      .select('id, status, updated_at')
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'verified');

    const weeklyThroughput = recentTasks?.length || 0;

    // Bottleneck detection using queuing theory
    const { data: wipTasks } = await supabaseClient
      .from('tasks')
      .select('status')
      .in('status', ['assigned', 'in_progress', 'completed']);

    const wipByStatus = wipTasks?.reduce((acc: any, task: any) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Little's Law application: WIP = Throughput × Lead Time
    const bottleneckScore = weeklyThroughput > 0 ? 
      (wipByStatus.in_progress || 0) / weeklyThroughput : 0;

    return {
      cycle_time: cycleTime,
      weekly_throughput: weeklyThroughput,
      wip_by_status: wipByStatus,
      bottleneck_score: bottleneckScore,
      event_timestamp: event.timestamp,
    };

  } catch (error) {
    console.error('Error processing analytics:', error);
    return null;
  }
}

async function generateInsights(supabaseClient: any, userId: string) {
  try {
    const insights = [];

    // Fetch user's task history for pattern analysis
    const { data: userTasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (!userTasks || userTasks.length === 0) {
      return [];
    }

    // Pattern 1: Task completion velocity analysis
    const completedTasks = userTasks.filter(t => t.status === 'verified');
    const recentCompletions = completedTasks.filter(t => {
      const taskDate = new Date(t.updated_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return taskDate >= weekAgo;
    });

    if (recentCompletions.length > completedTasks.length * 0.5) {
      insights.push({
        type: 'velocity_improvement',
        message: 'Your task completion velocity has increased significantly this week!',
        confidence: 0.85,
        action: 'Keep up the momentum with current work patterns.'
      });
    }

    // Pattern 2: Priority handling efficiency
    const urgentTasks = userTasks.filter(t => t.priority === 'urgent');
    const urgentCompletionRate = urgentTasks.length > 0 ? 
      urgentTasks.filter(t => t.status === 'verified').length / urgentTasks.length : 0;

    if (urgentCompletionRate > 0.8) {
      insights.push({
        type: 'priority_efficiency',
        message: 'Excellent handling of urgent tasks - 80%+ completion rate.',
        confidence: 0.9,
        action: 'Consider mentoring others on urgent task management.'
      });
    }

    // Pattern 3: Workflow optimization suggestion
    const tasksByStatus = userTasks.reduce((acc: any, task: any) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    if ((tasksByStatus.in_progress || 0) > (tasksByStatus.completed || 0) * 2) {
      insights.push({
        type: 'workflow_optimization',
        message: 'High work-in-progress detected. Consider focusing on fewer tasks simultaneously.',
        confidence: 0.75,
        action: 'Try limiting concurrent tasks to 2-3 for better focus and completion rates.'
      });
    }

    return insights;

  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

async function updateMetrics(supabaseClient: any, taskId: string, eventType: string) {
  try {
    // Update or create metrics record
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingMetric } = await supabaseClient
      .from('kanban_metrics')
      .select('*')
      .eq('date', today)
      .single();

    const metricUpdate = {
      date: today,
      total_events: (existingMetric?.total_events || 0) + 1,
      status_changes: eventType === 'status_change' ? 
        (existingMetric?.status_changes || 0) + 1 : 
        (existingMetric?.status_changes || 0),
      updated_at: new Date().toISOString()
    };

    if (existingMetric) {
      await supabaseClient
        .from('kanban_metrics')
        .update(metricUpdate)
        .eq('id', existingMetric.id);
    } else {
      await supabaseClient
        .from('kanban_metrics')
        .insert({
          ...metricUpdate,
          created_at: new Date().toISOString()
        });
    }

  } catch (error) {
    console.error('Error updating metrics:', error);
  }
}