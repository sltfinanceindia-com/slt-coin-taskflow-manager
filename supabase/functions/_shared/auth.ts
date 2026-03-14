import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export interface AuthenticatedUser {
  userId: string;         // profile.id
  authUserId: string;     // auth.users.id
  organizationId: string;
  role: string;
}

/**
 * Verifies the JWT from the Authorization header and returns the authenticated user's
 * profile ID, organization ID, and role. Throws a Response if auth fails.
 */
export async function authenticateRequest(req: Request): Promise<AuthenticatedUser> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized - No auth token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Invalid token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("id, organization_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Response(
      JSON.stringify({ error: "Profile not found" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Read role from user_roles table (authoritative source) instead of profiles.role
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, supabaseServiceKey);

  const { data: roleRecords } = await serviceClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const rolePriority: Record<string, number> = {
    super_admin: 10, org_admin: 9, admin: 9, hr_admin: 8,
    project_manager: 8, finance_manager: 8, manager: 7,
    team_lead: 6, employee: 5, intern: 4,
  };

  let highestRole = "employee";
  if (roleRecords && roleRecords.length > 0) {
    highestRole = roleRecords.reduce((best, cur) =>
      (rolePriority[cur.role] || 0) > (rolePriority[best.role] || 0) ? cur : best
    ).role;
  }

  return {
    userId: profile.id,
    authUserId: user.id,
    organizationId: profile.organization_id,
    role: highestRole,
  };
}
