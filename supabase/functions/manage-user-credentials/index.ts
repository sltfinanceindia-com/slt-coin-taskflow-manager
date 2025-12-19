import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 Starting user credentials management request');
    
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

    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ User authentication failed:', userError?.message);
      throw new Error('Unauthorized');
    }

    console.log('✅ User authenticated:', user.id);

    // Check if user has admin role using user_roles table (proper role checking)
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    console.log('User roles lookup result:', { userRoles, roleError: roleError?.message });

    if (roleError) {
      console.error('❌ Database error checking admin role:', roleError);
      throw new Error('Unauthorized: Admin access required');
    }

    if (!userRoles || userRoles.length === 0) {
      console.error('❌ No roles found for user:', user.id);
      throw new Error('Unauthorized: Admin access required');
    }

    const hasAdminRole = userRoles.some(r => 
      r.role === 'admin' || r.role === 'org_admin' || r.role === 'super_admin'
    );

    if (!hasAdminRole) {
      console.error('❌ User does not have admin role. Roles:', userRoles.map(r => r.role));
      throw new Error('Unauthorized: Admin access required');
    }

    console.log('✅ Admin role verified via user_roles table');

    // Parse request body
    const body = await req.json();
    const { action, userId, userIds } = body;
    
    if (!action) {
      throw new Error('Missing required parameter: action');
    }

    if (!userId && !userIds) {
      throw new Error('Missing required parameter: userId or userIds');
    }

    console.log(`🔐 Admin ${user.id} attempting to ${action} user ${userId || 'multiple users'}`);

    let result;

    switch (action) {
      case 'activate':
        if (!userId) throw new Error('userId is required for activate action');
        
        // Get the admin's profile id who is reactivating
        const { data: adminProfile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Update profile to active (using id column, not user_id)
        const { error: activateError } = await supabaseClient
          .from('profiles')
          .update({ 
            is_active: true,
            reactivated_at: new Date().toISOString(),
            reactivated_by: adminProfile?.id
          })
          .eq('id', userId);

        if (activateError) {
          console.error('❌ Activate error:', activateError);
          throw new Error(`Failed to activate user: ${activateError.message}`);
        }

        // Ensure chat_users entry exists and is active
        const { error: chatUserError } = await supabaseClient
          .from('chat_users')
          .upsert({
            user_id: userId,
            status: 'offline',
            is_active: true,
            last_seen: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (chatUserError) {
          console.warn('⚠️ Chat user update warning:', chatUserError);
        }

        // Update user_presence
        const { error: presenceError } = await supabaseClient
          .rpc('update_user_presence', {
            p_user_id: userId,
            p_is_online: false
          });

        if (presenceError) {
          console.warn('⚠️ Presence update warning:', presenceError);
        }

        console.log(`✅ User ${userId} activated successfully`);
        result = { success: true, message: 'User activated and chat access restored', userId, isActive: true };
        break;

      case 'deactivate':
        if (!userId) throw new Error('userId is required for deactivate action');
        
        // Get reason from body if provided
        const { reason } = body;

        // Get the admin's profile id who is deactivating
        const { data: adminProfileDe } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        // Update profile to inactive (using id column, not user_id)
        const { error: deactivateError } = await supabaseClient
          .from('profiles')
          .update({ 
            is_active: false,
            deactivated_at: new Date().toISOString(),
            deactivated_by: adminProfileDe?.id,
            deactivation_reason: reason || 'Deactivated by admin'
          })
          .eq('id', userId);

        if (deactivateError) {
          console.error('❌ Deactivate error:', deactivateError);
          throw new Error(`Failed to deactivate user: ${deactivateError.message}`);
        }

        // Sign out the user (this will invalidate their session)
        try {
          const { error: signOutError } = await supabaseClient.auth.admin.signOut(userId);
          if (signOutError) {
            console.warn(`⚠️ Failed to sign out user ${userId}:`, signOutError);
          } else {
            console.log(`✅ User ${userId} signed out successfully`);
          }
        } catch (signOutErr) {
          console.warn(`⚠️ Sign out exception:`, signOutErr);
        }

        console.log(`✅ User ${userId} deactivated successfully`);
        result = { success: true, message: 'User deactivated successfully', userId, isActive: false };
        break;

      case 'bulk_activate':
      case 'bulk_deactivate':
        if (!userIds || !Array.isArray(userIds)) {
          throw new Error('userIds array is required for bulk operations');
        }

        const isActive = action === 'bulk_activate';
        const { error: bulkError } = await supabaseClient
          .from('profiles')
          .update({ is_active: isActive })
          .in('id', userIds);

        if (bulkError) {
          console.error('❌ Bulk operation error:', bulkError);
          throw new Error(`Bulk operation failed: ${bulkError.message}`);
        }

        // Sign out deactivated users
        if (!isActive) {
          for (const uid of userIds) {
            try {
              await supabaseClient.auth.admin.signOut(uid);
              console.log(`✅ Signed out user ${uid}`);
            } catch (err) {
              console.warn(`⚠️ Failed to sign out user ${uid}:`, err);
            }
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