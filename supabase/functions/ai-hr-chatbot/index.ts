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

// Fetch organization context for AI
async function getOrganizationContext(supabase: any, organizationId: string, userId: string) {
  let context = '';
  
  try {
    const { data: org } = await supabase
      .from('organizations')
      .select('name, domain, settings')
      .eq('id', organizationId)
      .single();
    
    if (org) {
      context += `Organization: ${org.name}\n`;
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name, role, department_id, departments(name)')
      .eq('id', userId)
      .single();
    
    if (userProfile) {
      context += `Current User: ${userProfile.full_name}, Role: ${userProfile.role}`;
      if (userProfile.departments?.name) {
        context += `, Department: ${userProfile.departments.name}`;
      }
      context += '\n';
    }

    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, priority, end_date')
      .eq('assigned_to', userId)
      .in('status', ['assigned', 'in_progress'])
      .order('end_date', { ascending: true })
      .limit(10);
    
    if (tasks?.length > 0) {
      context += `\nUser's Active Tasks (${tasks.length}):\n`;
      tasks.forEach((t: any, i: number) => {
        context += `${i + 1}. ${t.title} - Status: ${t.status}, Priority: ${t.priority}, Due: ${t.end_date}\n`;
      });
    }

    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .limit(20);
    
    if (teamMembers?.length > 0) {
      context += `\nOrganization Team Members (${teamMembers.length}):\n`;
      teamMembers.slice(0, 10).forEach((m: any) => {
        context += `- ${m.full_name} (${m.role})\n`;
      });
      if (teamMembers.length > 10) {
        context += `... and ${teamMembers.length - 10} more\n`;
      }
    }

    const { data: departments } = await supabase
      .from('departments')
      .select('name, description')
      .eq('organization_id', organizationId);
    
    if (departments?.length > 0) {
      context += `\nDepartments: ${departments.map((d: any) => d.name).join(', ')}\n`;
    }

    const { data: projects } = await supabase
      .from('projects')
      .select('name, status, description')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .limit(10);
    
    if (projects?.length > 0) {
      context += `\nActive Projects:\n`;
      projects.forEach((p: any) => {
        context += `- ${p.name}: ${p.description || 'No description'}\n`;
      });
    }

    const { data: leaveBalance } = await supabase
      .from('leave_balances')
      .select('leave_type, balance, used')
      .eq('user_id', userId)
      .limit(5);
    
    if (leaveBalance?.length > 0) {
      context += `\nUser's Leave Balance:\n`;
      leaveBalance.forEach((l: any) => {
        context += `- ${l.leave_type}: ${l.balance} days (${l.used} used)\n`;
      });
    }

  } catch (error) {
    console.error('Error fetching org context:', error);
  }
  
  return context;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate and get verified user info
    const authedUser = await authenticateRequest(req);

    const { messages, conversationId, stream = true } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Use verified user info instead of request body
    const userId = authedUser.userId;
    const organizationId = authedUser.organizationId;
    const userRole = authedUser.role;

    // Fetch organization context
    let orgContext = '';
    if (organizationId && userId) {
      orgContext = await getOrganizationContext(supabase, organizationId, userId);
      console.log('Organization context loaded:', orgContext.substring(0, 200) + '...');
    }

    // Role-based access level
    const roleAccessLevel = {
      super_admin: 'full access to all organization data',
      org_admin: 'full access to organization data, employee records, and settings',
      manager: 'access to team data, own team members, and department information',
      team_lead: 'access to assigned team members and their tasks',
      employee: 'access to own data, tasks, and general policies only',
    }[userRole] || 'limited access to own data only';

    const systemPrompt = `You are an intelligent AI Assistant for a workforce management platform. You have access to real-time organization data and can help with various tasks.

## CRITICAL: Role-Based Access Control
Current User Role: ${userRole}
Access Level: ${roleAccessLevel}

### STRICT RULES BASED ON ROLE:
${userRole === 'employee' ? `
- DO NOT reveal other employees' salary, performance ratings, or personal data
- DO NOT share confidential HR decisions or management discussions
- DO NOT provide access to data outside of the user's own records
- For HR policy questions, provide general policy information only
- For questions about other employees, only share publicly available info (name, department, role)
` : userRole === 'manager' || userRole === 'team_lead' ? `
- Only share team member data for employees who report to this user
- DO NOT share data about employees outside their team
- DO NOT reveal executive decisions or confidential HR matters
` : `
- Full access is granted for administrative purposes
`}

### HANDLING IRRELEVANT QUESTIONS:
If a user asks about topics unrelated to work (politics, personal advice, entertainment, etc.), respond politely:
"I'm here to help with work-related questions. For [topic], please consult appropriate resources. Is there anything work-related I can help you with?"

## Organization Context
${orgContext || 'No organization context available.'}

## Your Capabilities
1. **HR Policies & Procedures**: Answer questions about leave policies, benefits, workplace rules
2. **Task Management**: Help users understand their tasks, priorities, and deadlines
3. **Team Information**: Provide information about team members, departments, and org structure
4. **Project Updates**: Share information about active projects and their status
5. **Employee Support**: Guide employees through HR processes like leave applications, expense claims
6. **Performance Management**: Help with goal setting, feedback, performance reviews
7. **Time & Attendance**: Answer questions about timesheets, overtime, work schedules

## Guidelines
- Be professional, helpful, and conversational
- Use the organization context above to provide personalized responses
- If asked about specific employees or data not in your context, acknowledge the limitation
- For sensitive issues (harassment, discrimination, termination), recommend speaking with HR directly
- Provide clear, actionable guidance when possible
- Keep responses concise but comprehensive
- Use bullet points for multi-step processes

Remember: You have access to real organization data - use it to provide relevant, personalized assistance!`;

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

    // Log successful usage with verified user info
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
    if (error instanceof Response) return error;
    console.error("AI HR Chatbot error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
