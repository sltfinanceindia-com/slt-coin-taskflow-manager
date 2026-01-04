import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const systemPrompt = `You are an intelligent HR Assistant for a workforce management platform. Your role is to help employees and HR professionals with:

1. **HR Policies & Procedures**: Answer questions about leave policies, benefits, workplace rules
2. **Employee Support**: Guide employees through HR processes like leave applications, expense claims
3. **Performance Management**: Help with goal setting, feedback, performance reviews
4. **Onboarding**: Assist new employees with orientation questions
5. **Time & Attendance**: Answer questions about timesheets, overtime, work schedules
6. **Training & Development**: Guide employees to relevant training resources

Guidelines:
- Be professional, helpful, and empathetic
- If you don't know something specific to their organization, acknowledge it and suggest they contact HR directly
- For sensitive issues (harassment, discrimination, termination), always recommend speaking with HR directly
- Provide clear, actionable guidance when possible
- Keep responses concise but comprehensive
- Use bullet points for multi-step processes
- If the question is outside HR scope, politely redirect

Remember: You're here to make HR processes easier and more accessible for everyone.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, userId, organizationId, stream = true } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Log usage
    const startTime = Date.now();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream,
      }),
    });

    if (!response.ok) {
      const responseTime = Date.now() - startTime;
      
      // Log failed usage
      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        organization_id: organizationId,
        feature_type: 'chatbot',
        action: 'chat_completion',
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
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Log successful usage
    const responseTime = Date.now() - startTime;
    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      organization_id: organizationId,
      feature_type: 'chatbot',
      action: 'chat_completion',
      response_time_ms: responseTime,
      success: true,
    });

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("AI HR Chatbot error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
