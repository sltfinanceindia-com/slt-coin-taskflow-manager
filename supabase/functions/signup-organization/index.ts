import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { companyName, fullName, email, password } = await req.json();

    // Validate inputs
    if (!companyName || !fullName || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate subdomain from company name
    const subdomain = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);

    // Check if subdomain already exists
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .maybeSingle();

    // If subdomain exists, append a random suffix
    let finalSubdomain = subdomain;
    if (existingOrg) {
      const suffix = Math.random().toString(36).substring(2, 6);
      finalSubdomain = `${subdomain}-${suffix}`;
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUser?.users?.some(u => u.email === email);
    
    if (emailExists) {
      return new Response(
        JSON.stringify({ error: 'An account with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating organization:', { companyName, subdomain: finalSubdomain });

    // 1. Create the organization (bypasses RLS with service role)
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: companyName,
        subdomain: finalSubdomain,
        status: 'trial',
        max_users: 5,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation error:', orgError);
      return new Response(
        JSON.stringify({ error: 'Failed to create organization: ' + orgError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Organization created:', orgData.id);

    // 2. Create the auth user with admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for smoother experience
      user_metadata: {
        full_name: fullName,
        organization_id: orgData.id,
        role: 'org_admin',
      },
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      // Rollback organization creation
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create user: ' + authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth user created:', authData.user.id);

    // 3. Update organization with created_by
    await supabaseAdmin
      .from('organizations')
      .update({ created_by: authData.user.id })
      .eq('id', orgData.id);

    // 4. Create the profile (trigger may not work with admin API)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        user_id: authData.user.id,
        full_name: fullName,
        email: email,
        organization_id: orgData.id,
        is_active: true,
        role: 'org_admin',
        total_coins: 0,
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Critical error - rollback and fail
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create profile: ' + profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile created for:', authData.user.id);

    // 5. Create user_roles entry
    const { error: roleError } = await supabaseAdmin.from('user_roles').upsert({
      user_id: authData.user.id,
      role: 'org_admin',
      organization_id: orgData.id,
    }, {
      onConflict: 'user_id,role'
    });

    if (roleError) {
      console.error('Role assignment error:', roleError);
    }

    // 6. Create chat_users entry
    await supabaseAdmin.from('chat_users').upsert({
      user_id: authData.user.id,
      status: 'offline',
      organization_id: orgData.id,
    }, {
      onConflict: 'user_id'
    });

    console.log('Signup completed successfully for:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Organization and account created successfully',
        organizationId: orgData.id,
        userId: authData.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
