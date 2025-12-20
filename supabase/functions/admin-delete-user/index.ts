import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's auth token to verify identity
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify the caller is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Failed to get user:', userError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id)

    // Get the caller's profile to check organization
    const { data: callerProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !callerProfile) {
      console.error('Failed to get caller profile:', profileError?.message)
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role via user_roles table
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError) {
      console.error('Failed to get user role:', roleError.message)
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const allowedRoles = ['admin', 'org_admin', 'super_admin']
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      console.error('User does not have admin role:', userRole?.role)
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User role verified:', userRole.role)

    // Get the userId to delete from request body
    const { userId } = await req.json()
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided:', userId)
      return new Response(
        JSON.stringify({ error: 'Invalid userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Attempting to delete user:', userId)

    // Verify the target user belongs to the same organization
    const { data: targetProfile, error: targetError } = await supabaseClient
      .from('profiles')
      .select('id, organization_id')
      .eq('user_id', userId)
      .single()

    if (targetError || !targetProfile) {
      console.error('Target user not found:', targetError?.message)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ensure caller can only delete users from their own organization (unless super_admin)
    if (userRole.role !== 'super_admin' && targetProfile.organization_id !== callerProfile.organization_id) {
      console.error('Organization mismatch - caller org:', callerProfile.organization_id, 'target org:', targetProfile.organization_id)
      return new Response(
        JSON.stringify({ error: 'Cannot delete users from other organizations' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role client for admin operation
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete the user using admin API
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Failed to delete user:', deleteError.message)
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully deleted user:', userId)

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in admin-delete-user:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
