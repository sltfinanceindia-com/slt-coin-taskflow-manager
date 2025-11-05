import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    console.log('🔍 Starting stale session cleanup...');

    // Find all sessions older than 24 hours without logout_time
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: staleSessions, error: fetchError } = await supabase
      .from('session_logs')
      .select('id, user_id, login_time')
      .is('logout_time', null)
      .lt('login_time', twentyFourHoursAgo);

    if (fetchError) {
      console.error('❌ Error fetching stale sessions:', fetchError);
      throw fetchError;
    }

    if (!staleSessions || staleSessions.length === 0) {
      console.log('✅ No stale sessions found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No stale sessions to cleanup',
          closedCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${staleSessions.length} stale sessions to close`);

    // Close each stale session
    const closurePromises = staleSessions.map(async (session) => {
      const loginTime = new Date(session.login_time);
      const logoutTime = new Date(loginTime.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours

      // Note: session_duration_minutes is a GENERATED column, so we only update logout_time
      // The duration will be automatically calculated by the database
      const { error: updateError } = await supabase
        .from('session_logs')
        .update({
          logout_time: logoutTime.toISOString(),
          closure_type: 'auto',
          closure_note: 'Auto-closed by system: Session exceeded 24 hours without logout'
        })
        .eq('id', session.id);

      if (updateError) {
        console.error(`❌ Failed to close session ${session.id}:`, updateError);
        return { success: false, sessionId: session.id, error: updateError.message };
      }

      console.log(`✅ Closed stale session ${session.id} for user ${session.user_id}`);
      return { success: true, sessionId: session.id };
    });

    const results = await Promise.all(closurePromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`🎉 Cleanup complete: ${successCount} closed, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stale session cleanup completed',
        closedCount: successCount,
        failedCount: failureCount,
        details: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Cleanup function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
