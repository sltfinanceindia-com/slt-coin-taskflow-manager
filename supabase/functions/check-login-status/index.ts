import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, action, success } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Action: check - Check if account is locked
    if (action === "check") {
      const { data, error } = await adminClient.rpc("is_account_locked", {
        p_email: email.toLowerCase().trim(),
      });

      if (error) {
        console.error("Error checking lockout:", error);
        return new Response(
          JSON.stringify({ locked: false, remainingMinutes: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = data?.[0] || { locked: false, remaining_minutes: 0, failed_count: 0 };
      return new Response(
        JSON.stringify({
          locked: result.locked,
          remainingMinutes: result.remaining_minutes,
          failedCount: result.failed_count,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: record - Record a login attempt
    if (action === "record") {
      const ipAddress = req.headers.get("x-forwarded-for") || 
                        req.headers.get("cf-connecting-ip") || 
                        "unknown";

      const { error } = await adminClient
        .from("login_attempts")
        .insert({
          email: email.toLowerCase().trim(),
          ip_address: ipAddress,
          success: success === true,
        });

      if (error) {
        console.error("Error recording attempt:", error);
      }

      // If successful login, clear previous failed attempts
      if (success === true) {
        await adminClient
          .from("login_attempts")
          .delete()
          .eq("email", email.toLowerCase().trim())
          .eq("success", false);
      }

      return new Response(
        JSON.stringify({ recorded: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: cleanup - Remove old attempts
    if (action === "cleanup") {
      await adminClient.rpc("cleanup_old_login_attempts");
      return new Response(
        JSON.stringify({ cleaned: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'check', 'record', or 'cleanup'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
