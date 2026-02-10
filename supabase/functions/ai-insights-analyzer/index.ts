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

const analysisPrompts: Record<string, string> = {
  sentiment: `You are a sentiment analysis expert. Analyze the provided feedback/survey responses and:
- Determine overall sentiment (positive, neutral, negative)
- Identify key themes and topics
- Highlight specific concerns or praise
- Provide a confidence score (0-100)
- Suggest follow-up actions if needed

Return your analysis in JSON format with keys: sentiment, score, themes, concerns, positives, recommendations`,

  attrition_risk: `You are an HR analytics expert specializing in employee retention. Analyze the provided employee data and:
- Calculate attrition risk score (0-100)
- Identify risk factors
- Compare to typical patterns
- Suggest retention strategies
- Prioritize intervention actions

Return your analysis in JSON format with keys: risk_score, risk_level, factors, comparison, strategies, priority_actions`,

  workforce_insights: `You are a workforce analytics expert. Analyze the provided organizational data and:
- Identify key workforce trends
- Highlight department/team patterns
- Flag potential issues
- Recognize positive developments
- Suggest optimization opportunities

Return your analysis in JSON format with keys: trends, patterns, issues, positives, opportunities, recommendations`,

  report_insights: `You are a data analysis expert. Analyze the provided report data and:
- Summarize key findings
- Identify notable trends
- Highlight anomalies or outliers
- Compare to benchmarks if available
- Provide actionable insights

Return your analysis in JSON format with keys: summary, trends, anomalies, benchmarks, insights, action_items`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate and get verified user info
    const authedUser = await authenticateRequest(req);

    const { analysisType, data, saveInsight = false } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!analysisPrompts[analysisType]) {
      throw new Error(`Invalid analysis type: ${analysisType}`);
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const startTime = Date.now();

    const userMessage = `Analyze the following data:\n\n${JSON.stringify(data, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: analysisPrompts[analysisType] },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      await supabase.from('ai_usage_logs').insert({
        user_id: authedUser.userId,
        organization_id: authedUser.organizationId,
        feature_type: 'insights',
        action: analysisType,
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
    const resultText = responseData.choices?.[0]?.message?.content || '';
    
    let result;
    try {
      const jsonMatch = resultText.match(/```json\n?([\s\S]*?)\n?```/) || resultText.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : resultText);
    } catch {
      result = { raw: resultText };
    }

    // Log successful usage with verified user info
    await supabase.from('ai_usage_logs').insert({
      user_id: authedUser.userId,
      organization_id: authedUser.organizationId,
      feature_type: 'insights',
      action: analysisType,
      response_time_ms: responseTime,
      success: true,
    });

    // Optionally save the insight
    if (saveInsight && authedUser.organizationId) {
      const severity = result.risk_score > 70 || result.score < 30 ? 'critical' : 
                       result.risk_score > 40 || result.score < 50 ? 'warning' : 'info';
      
      await supabase.from('ai_insights').insert({
        organization_id: authedUser.organizationId,
        insight_type: analysisType,
        title: `${analysisType.replace('_', ' ')} Analysis`,
        content: result,
        confidence_score: result.score ? result.score / 100 : 0.8,
        severity,
        is_actionable: !!(result.recommendations || result.action_items || result.strategies),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return new Response(JSON.stringify({ result, analysisType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("AI Insights Analyzer error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
