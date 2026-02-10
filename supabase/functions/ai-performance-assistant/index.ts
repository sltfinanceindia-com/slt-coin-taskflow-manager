import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const actionPrompts: Record<string, string> = {
  generate_review: `You are a performance management expert. Generate a balanced, constructive performance review based on the provided data. Include:
- Summary of key achievements
- Strengths demonstrated
- Areas for improvement (framed constructively)
- Specific examples where possible
- Development recommendations
- Overall assessment

Be professional, fair, and development-focused. Avoid generic phrases and make it personalized.`,

  suggest_goals: `You are a goal-setting coach. Based on the employee's role, past performance, and company objectives, suggest SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). For each goal:
- Clear objective statement
- Success metrics
- Timeline
- Resources needed
- Connection to broader objectives

Make goals challenging but achievable.`,

  improve_feedback: `You are a communication expert specializing in performance feedback. Take the rough feedback points provided and transform them into:
- Clear, specific observations
- Constructive language
- Actionable suggestions
- Balanced perspective

Maintain the core message while improving tone and clarity.`,

  generate_development_plan: `You are a talent development specialist. Create a personalized development plan with:
- Current skill assessment
- Target skills to develop
- Learning activities (training, projects, mentoring)
- Timeline with milestones
- Success indicators
- Support needed

Make it practical and aligned with career growth.`,

  analyze_performance_trends: `You are a performance analytics expert. Analyze the provided performance data and identify:
- Key trends and patterns
- Areas of consistent strength
- Areas needing attention
- Comparison to team/org averages
- Recommendations for improvement
- Risk factors to monitor

Provide actionable insights.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate and get verified user info
    const authedUser = await authenticateRequest(req);

    const { action, data } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!actionPrompts[action]) {
      throw new Error(`Invalid action: ${action}`);
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const startTime = Date.now();

    const userMessage = `Based on the following information, ${action.replace('_', ' ')}:\n\n${JSON.stringify(data, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: actionPrompts[action] },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      await supabase.from('ai_usage_logs').insert({
        user_id: authedUser.userId,
        organization_id: authedUser.organizationId,
        feature_type: 'performance',
        action,
        response_time_ms: responseTime,
        success: false,
        error_message: `API error: ${response.status}`,
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const responseData = await response.json();
    const result = responseData.choices?.[0]?.message?.content || '';

    // Log successful usage with verified user info
    await supabase.from('ai_usage_logs').insert({
      user_id: authedUser.userId,
      organization_id: authedUser.organizationId,
      feature_type: 'performance',
      action,
      response_time_ms: responseTime,
      success: true,
    });

    return new Response(JSON.stringify({ result, action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("AI Performance Assistant error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
