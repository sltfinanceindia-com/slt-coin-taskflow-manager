import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create regular client to verify the caller
    const authHeader = req.headers.get('Authorization')!;
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify caller is authenticated and is an admin
    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser();
    if (authError || !caller) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get caller's profile and role
    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, organization_id, role')
      .eq('user_id', caller.id)
      .single();

    if (profileError || !callerProfile) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Caller profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller has admin role
    const { data: callerRoles } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id);

    const isAdmin = callerRoles?.some(r => 
      ['super_admin', 'org_admin', 'admin'].includes(r.role)
    );

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { email, password, full_name, role, department, employee_id } = await req.json();

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and full_name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating user ${email} for organization ${callerProfile.organization_id}`);

    // Create user using admin API (this does NOT log in the new user)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: role || 'intern',
        organization_id: callerProfile.organization_id,
      }
    });

    if (createError) {
      console.error('Create user error:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User created with id: ${newUser.user.id}`);

    // Create profile for the new user
    const { error: insertProfileError } = await adminClient
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        user_id: newUser.user.id,
        email,
        full_name,
        role: role || 'intern',
        department: department || null,
        employee_id: employee_id || null,
        organization_id: callerProfile.organization_id,
        is_active: true,
      }, { onConflict: 'id' });

    if (insertProfileError) {
      console.error('Insert profile error:', insertProfileError);
      // Don't fail - user was created, profile can be fixed
    }

    // Add user role
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role || 'intern',
        organization_id: callerProfile.organization_id,
      });

    if (roleError) {
      console.error('Insert role error:', roleError);
    }

    // Create chat_users entry
    await adminClient
      .from('chat_users')
      .insert({
        user_id: newUser.user.id,
        status: 'offline',
        organization_id: callerProfile.organization_id,
      });

    console.log(`Successfully created user ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-organization-user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
