import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get admin user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { action, userId } = await req.json();

    if (!action || !userId) {
      throw new Error('Missing required parameters: action and userId');
    }

    console.log(`🔐 Admin ${user.id} attempting to ${action} user ${userId}`);

    let result;

    switch (action) {
      case 'activate':
        // Update profile to active
        const { error: activateError } = await supabaseClient
          .from('profiles')
          .update({ is_active: true })
          .eq('user_id', userId);

        if (activateError) {
          throw new Error(`Failed to activate user: ${activateError.message}`);
        }

        console.log(`✅ User ${userId} activated successfully`);
        result = { success: true, message: 'User activated successfully', userId, isActive: true };
        break;

      case 'deactivate':
        // Update profile to inactive
        const { error: deactivateError } = await supabaseClient
          .from('profiles')
          .update({ is_active: false })
          .eq('user_id', userId);

        if (deactivateError) {
          throw new Error(`Failed to deactivate user: ${deactivateError.message}`);
        }

        // Sign out the user (this will invalidate their session)
        const { error: signOutError } = await supabaseClient.auth.admin.signOut(userId);
        if (signOutError) {
          console.warn(`⚠️ Failed to sign out user ${userId}:`, signOutError);
        }

        console.log(`✅ User ${userId} deactivated successfully`);
        result = { success: true, message: 'User deactivated successfully', userId, isActive: false };
        break;

      case 'bulk_activate':
      case 'bulk_deactivate':
        const { userIds } = await req.json();
        if (!userIds || !Array.isArray(userIds)) {
          throw new Error('userIds array is required for bulk operations');
        }

        const isActive = action === 'bulk_activate';
        const { error: bulkError } = await supabaseClient
          .from('profiles')
          .update({ is_active: isActive })
          .in('user_id', userIds);

        if (bulkError) {
          throw new Error(`Bulk operation failed: ${bulkError.message}`);
        }

        // Sign out deactivated users
        if (!isActive) {
          for (const uid of userIds) {
            await supabaseClient.auth.admin.signOut(uid).catch(err => 
              console.warn(`⚠️ Failed to sign out user ${uid}:`, err)
            );
          }
        }

        console.log(`✅ Bulk ${action} completed for ${userIds.length} users`);
        result = { 
          success: true, 
          message: `${userIds.length} users ${isActive ? 'activated' : 'deactivated'}`,
          count: userIds.length,
          isActive
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}. Supported actions: activate, deactivate, bulk_activate, bulk_deactivate`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error managing user credentials:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});