import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const today = new Date().toISOString().split('T')[0]

    // Get all active recurring tasks where next_occurrence <= today
    const { data: recurringTasks, error: fetchError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('is_active', true)
      .lte('next_occurrence', today)

    if (fetchError) throw fetchError

    let created = 0

    for (const rt of recurringTasks || []) {
      // Create a new task from the recurring template
      const { error: insertError } = await supabase
        .from('tasks')
        .insert({
          title: rt.title,
          description: rt.description,
          assigned_to: rt.assigned_to,
          organization_id: rt.organization_id,
          created_by: rt.created_by,
          status: 'assigned',
          priority: 'medium',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })

      if (insertError) {
        console.error(`Failed to create task for recurring ${rt.id}:`, insertError)
        continue
      }

      // Calculate next occurrence
      const nextDate = new Date(rt.next_occurrence)
      switch (rt.frequency) {
        case 'daily': nextDate.setDate(nextDate.getDate() + 1); break
        case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break
        case 'bi-weekly': nextDate.setDate(nextDate.getDate() + 14); break
        case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break
        case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break
        default: nextDate.setDate(nextDate.getDate() + 7)
      }

      // Update recurring task with new next_occurrence and last_created
      await supabase
        .from('recurring_tasks')
        .update({
          next_occurrence: nextDate.toISOString().split('T')[0],
          last_created: today,
        })
        .eq('id', rt.id)

      created++
    }

    return new Response(
      JSON.stringify({ success: true, tasks_created: created, checked: recurringTasks?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating recurring tasks:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
