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

const documentPrompts: Record<string, string> = {
  offer_letter: `You are an HR document specialist. Generate a professional job offer letter with the following structure:
- Company letterhead placeholder
- Date
- Candidate's name and address
- Position offered with start date
- Compensation details (salary, benefits)
- Terms and conditions
- Acceptance deadline
- Signature blocks

Use formal business language and maintain a welcoming yet professional tone.`,

  policy_document: `You are a policy writing expert. Create a comprehensive company policy document with:
- Policy title and effective date
- Purpose and scope
- Definitions (if needed)
- Policy statements with numbered sections
- Procedures for compliance
- Exceptions and escalation process
- Review schedule
- Approval signatures section

Make it clear, unambiguous, and legally sound.`,

  termination_letter: `You are an HR document specialist. Generate a professional termination letter with:
- Company letterhead placeholder
- Date
- Employee name and details
- Clear statement of termination with effective date
- Reason for termination (if applicable)
- Final pay and benefits information
- Return of company property requirements
- Confidentiality reminders
- HR contact for questions

Be respectful, clear, and factual.`,

  performance_review: `You are a performance management expert. Create a comprehensive performance review document with:
- Employee information section
- Review period
- Performance rating scale explanation
- Sections for: Job Knowledge, Quality of Work, Productivity, Communication, Teamwork, Initiative
- Goals from previous period (with completion status)
- New goals for next period
- Training and development recommendations
- Overall assessment summary
- Signatures section

Make it balanced and development-focused.`,

  training_material: `You are a training content developer. Create engaging training material with:
- Module title and objectives
- Prerequisites (if any)
- Main content sections with clear headings
- Key concepts highlighted
- Practical examples and scenarios
- Knowledge check questions
- Summary and key takeaways
- Additional resources

Make it interactive and easy to follow.`,

  meeting_agenda: `You are a meeting facilitator. Create a professional meeting agenda with:
- Meeting title, date, time, location
- Attendees list
- Meeting objectives
- Agenda items with time allocations
- Discussion topics
- Action items section
- Next steps
- Adjournment time

Keep it organized and time-conscious.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate and get verified user info
    const authedUser = await authenticateRequest(req);

    const { documentType, details } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!documentPrompts[documentType]) {
      throw new Error(`Invalid document type: ${documentType}`);
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const startTime = Date.now();

    const userMessage = `Generate a ${documentType.replace('_', ' ')} with the following details:\n\n${JSON.stringify(details, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: documentPrompts[documentType] },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      await supabase.from('ai_usage_logs').insert({
        user_id: authedUser.userId,
        organization_id: authedUser.organizationId,
        feature_type: 'document_gen',
        action: documentType,
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
    const document = data.choices?.[0]?.message?.content || '';

    // Log successful usage with verified user info
    await supabase.from('ai_usage_logs').insert({
      user_id: authedUser.userId,
      organization_id: authedUser.organizationId,
      feature_type: 'document_gen',
      action: documentType,
      response_time_ms: responseTime,
      success: true,
    });

    return new Response(JSON.stringify({ document, documentType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("AI Document Generator error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
