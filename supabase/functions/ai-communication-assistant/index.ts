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
  compose: `You are a professional message composer. Generate a well-written message based on the user's brief description. Make it clear, professional, and appropriate for workplace communication. Only return the composed message, no explanations.`,
  
  improve: `You are a writing assistant. Improve the given text for clarity, grammar, and professionalism while maintaining the original meaning and tone. Only return the improved text, no explanations.`,
  
  change_tone: `You are a tone adjustment expert. Rewrite the given text with the specified tone while keeping the core message intact. Only return the rewritten text, no explanations.`,
  
  translate: `You are a professional translator. Translate the given text to the specified language accurately while maintaining the original meaning and tone. Only return the translated text, no explanations.`,
  
  summarize: `You are a summarization expert. Create a concise summary of the given conversation or text, highlighting key points and action items. Only return the summary, no explanations.`,
  
  generate_reply: `You are a reply assistant. Generate a professional and appropriate reply to the given message. Consider the context and maintain a helpful tone. Only return the reply, no explanations.`,
  
  extract_action_items: `You are a task extraction expert. Extract all action items, tasks, and follow-ups from the given text. Return them as a bulleted list. Only return the action items list, no explanations.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate and get verified user info
    const authedUser = await authenticateRequest(req);

    const { action, content, options } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!actionPrompts[action]) {
      throw new Error(`Invalid action: ${action}`);
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const startTime = Date.now();

    let userMessage = content;
    
    if (action === 'change_tone' && options?.tone) {
      userMessage = `Change the tone to ${options.tone}: ${content}`;
    } else if (action === 'translate' && options?.targetLanguage) {
      userMessage = `Translate to ${options.targetLanguage}: ${content}`;
    } else if (action === 'compose' && options?.context) {
      userMessage = `Context: ${options.context}\n\nBrief: ${content}`;
    }

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
        feature_type: 'composer',
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

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    // Log successful usage with verified user info
    await supabase.from('ai_usage_logs').insert({
      user_id: authedUser.userId,
      organization_id: authedUser.organizationId,
      feature_type: 'composer',
      action,
      response_time_ms: responseTime,
      success: true,
    });

    return new Response(JSON.stringify({ result, action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("AI Communication Assistant error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
