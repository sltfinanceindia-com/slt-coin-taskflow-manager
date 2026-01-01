import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, taskTitle, taskDescription, projectContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let prompt = "";
    
    switch (action) {
      case "generate_description":
        prompt = `You are a task management assistant. Generate a clear, detailed task description based on the following title. Keep it concise but actionable (2-3 sentences max).

Title: "${taskTitle}"
${projectContext ? `Project Context: ${projectContext}` : ""}

Respond with ONLY the description text, no formatting or labels.`;
        break;

      case "suggest_priority":
        prompt = `You are a task management assistant. Based on the task details, suggest an appropriate priority level.

Title: "${taskTitle}"
Description: "${taskDescription || 'No description provided'}"
${projectContext ? `Project Context: ${projectContext}` : ""}

Respond with ONLY one word: "low", "medium", or "high". No explanation.`;
        break;

      case "estimate_time":
        prompt = `You are a task management assistant. Estimate how many hours this task might take to complete.

Title: "${taskTitle}"
Description: "${taskDescription || 'No description provided'}"
${projectContext ? `Project Context: ${projectContext}` : ""}

Respond with ONLY a number representing hours (e.g., "2" or "4.5"). No units or explanation.`;
        break;

      case "suggest_subtasks":
        prompt = `You are a task management assistant. Break down this task into 3-5 smaller subtasks.

Title: "${taskTitle}"
Description: "${taskDescription || 'No description provided'}"
${projectContext ? `Project Context: ${projectContext}` : ""}

Respond with a JSON array of strings only, like: ["Subtask 1", "Subtask 2", "Subtask 3"]`;
        break;

      case "improve_description":
        prompt = `You are a task management assistant. Improve and expand the following task description to be clearer and more actionable. Keep it concise (3-4 sentences max).

Title: "${taskTitle}"
Current Description: "${taskDescription}"
${projectContext ? `Project Context: ${projectContext}` : ""}

Respond with ONLY the improved description text, no formatting or labels.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway Error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ result, action }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in ai-task-assistant:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});