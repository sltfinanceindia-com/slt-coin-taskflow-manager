import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Resend with validation
const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log("[email-notifications] RESEND_API_KEY configured:", resendApiKey ? "Yes" : "No");

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EmailNotificationRequest {
  type: 'message' | 'mention' | 'channel_invite' | 'task_assignment' | 'deadline_reminder' | 'task_assigned' | 'task_completed' | 'comment_added' | 'coins_earned' | 'login_notification' | 'logout_notification';
  recipient_email?: string;
  recipient_name?: string;
  // Support for legacy format
  emailType?: string;
  to?: string;
  recipientName?: string;
  data?: {
    sender_name?: string;
    channel_name?: string;
    message_content?: string;
    task_title?: string;
    deadline?: string;
    url?: string;
  };
  // Support for direct format
  taskTitle?: string;
  taskId?: string;
  coinAmount?: number;
  assignerName?: string;
  commenterName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[${requestId}] Email notification function called at ${new Date().toISOString()}`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Resend is configured
    if (!resend) {
      console.error(`[${requestId}] RESEND_API_KEY is not configured`);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Email service not configured. RESEND_API_KEY is missing.",
        requestId 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log(`[${requestId}] Supabase URL configured:`, supabaseUrl ? "Yes" : "No");
    console.log(`[${requestId}] Supabase service key configured:`, supabaseServiceKey ? "Yes" : "No");

    const supabase = createClient(supabaseUrl ?? "", supabaseServiceKey ?? "");

    // Parse request body
    let requestData: EmailNotificationRequest;
    try {
      requestData = await req.json();
      console.log(`[${requestId}] Request data:`, JSON.stringify({
        type: requestData.type || requestData.emailType,
        recipient: requestData.recipient_email || requestData.to,
        name: requestData.recipient_name || requestData.recipientName
      }));
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Invalid request body",
        requestId 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Normalize the request format (support both old and new formats)
    const type = requestData.type || requestData.emailType as any;
    const recipient_email = requestData.recipient_email || requestData.to;
    const recipient_name = requestData.recipient_name || requestData.recipientName || 'User';
    const data = requestData.data || {
      task_title: requestData.taskTitle,
      sender_name: requestData.assignerName || requestData.commenterName
    };

    // Validate required fields
    if (!recipient_email) {
      console.error(`[${requestId}] Missing recipient email`);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Recipient email is required",
        requestId 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!type) {
      console.error(`[${requestId}] Missing notification type`);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Notification type is required",
        requestId 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`[${requestId}] Processing ${type} notification for ${recipient_email}`);

    // Get user profile for daily limit checking
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', recipient_email)
      .single();

    // Check daily email limits (prevent spam)
    if (userProfile) {
      console.log(`[${requestId}] Checking daily limit for user ${userProfile.id}`);
      const { data: canSend, error: limitError } = await supabase
        .rpc('check_and_log_daily_email', {
          p_user_id: userProfile.id,
          p_email_type: type
        });

      if (limitError) {
        console.warn(`[${requestId}] Error checking daily limit:`, limitError);
        // Continue anyway - don't block emails if check fails
      } else if (!canSend) {
        console.log(`[${requestId}] Daily limit reached for ${type} to ${recipient_email} - skipping`);
        return new Response(JSON.stringify({ 
          success: true,
          message: "Email already sent today - skipped to prevent spam",
          skipped: true,
          requestId 
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } else {
      console.log(`[${requestId}] User profile not found for ${recipient_email} - proceeding without daily limit check`);
    }

    // Generate email content based on type
    let subject = "";
    let html = "";

    const baseStyles = `
      <style>
        .email-container { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 32px 24px; line-height: 1.6; color: #374151; }
        .highlight-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .coins-earned { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; font-size: 24px; font-weight: 700; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { color: #6b7280; font-size: 12px; margin: 0; }
        .company-name { color: #2563eb; font-weight: 600; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      </style>
    `;

    switch (type) {
      case 'message':
        subject = `New message from ${data.sender_name} in ${data.channel_name}`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>💬 New Message</h1></div><div class="content"><p>Hi ${recipient_name},</p><p><strong>${data.sender_name}</strong> sent a message in <strong>${data.channel_name}</strong>:</p><div class="highlight-box"><p>${data.message_content}</p></div></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      case 'mention':
        subject = `You were mentioned by ${data.sender_name}`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>📢 You were mentioned!</h1></div><div class="content"><p>Hi ${recipient_name},</p><p><strong>${data.sender_name}</strong> mentioned you in <strong>${data.channel_name}</strong>:</p><div class="highlight-box"><p>${data.message_content}</p></div></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      case 'channel_invite':
        subject = `You've been invited to join ${data.channel_name}`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>📨 Channel Invitation</h1></div><div class="content"><p>Hi ${recipient_name},</p><p><strong>${data.sender_name}</strong> has invited you to join <strong>${data.channel_name}</strong>.</p></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      case 'task_assignment':
      case 'task_assigned':
        subject = `📋 New Task Assigned: ${data.task_title || requestData.taskTitle || 'New Task'}`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>🎯 New Task Assigned</h1><p>You have a new task</p></div><div class="content"><p>Hi ${recipient_name},</p><p>${data.sender_name || requestData.assignerName || 'Your manager'} has assigned you a new task.</p><div class="highlight-box"><h3>📋 ${data.task_title || requestData.taskTitle || 'New Task'}</h3></div><p>Log in to your dashboard to view the task details.</p></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      case 'task_completed':
        subject = `✅ Task Completed: ${requestData.taskTitle || 'Task'}`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>✅ Task Completed</h1><p>Ready for review</p></div><div class="content"><p>Hi ${recipient_name},</p><p>A task has been completed and is awaiting your review.</p><div class="highlight-box"><h3>✅ ${requestData.taskTitle || 'Task'}</h3><p style="color: #16a34a; font-weight: 600;">Status: Awaiting Review</p></div></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      case 'comment_added':
        subject = `💬 New Comment: ${requestData.taskTitle || 'Task'}`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>💬 New Comment</h1></div><div class="content"><p>Hi ${recipient_name},</p><p>${requestData.commenterName || 'A team member'} added a comment to your task.</p><div class="highlight-box"><h3>💬 ${requestData.taskTitle || 'Task'}</h3></div></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      case 'coins_earned':
        subject = `🪙 Congratulations! You've Earned ${requestData.coinAmount || 0} SLT Coins!`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>🎉 Congratulations!</h1><p>You've earned SLT Coins</p></div><div class="content"><p>Hi ${recipient_name},</p><p>Outstanding work! Your effort has been rewarded.</p><div class="coins-earned">🪙 ${requestData.coinAmount || 0} SLT Coins Earned!</div><div class="highlight-box"><h3>🏆 ${requestData.taskTitle || 'Task'}</h3><p style="color: #16a34a; font-weight: 600;">Status: Verified & Approved</p></div></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      case 'login_notification':
        subject = `🔐 Welcome Back to SLT work HuB`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>🔐 Welcome Back!</h1><p>Secure login notification</p></div><div class="content"><p>Hi ${recipient_name},</p><p>You have successfully logged into your SLT work HuB account.</p><div class="highlight-box"><p><strong>Login Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p><p><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Successful</span></p></div><p>If this wasn't you, please contact your administrator.</p></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Security</span></p></div></div>`;
        break;

      case 'logout_notification':
        subject = `👋 Logged Out from SLT work HuB`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>👋 See You Soon!</h1><p>Logout notification</p></div><div class="content"><p>Hi ${recipient_name},</p><p>You have successfully logged out of your account.</p><div class="highlight-box"><p><strong>Logout Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p><p><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Successful</span></p></div></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      case 'deadline_reminder':
        subject = `⏰ Reminder: ${data.task_title} deadline approaching`;
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>⏰ Deadline Reminder</h1></div><div class="content"><p>Hi ${recipient_name},</p><p>This is a reminder that your task deadline is approaching:</p><div class="highlight-box" style="background: #fef2f2; border-color: #fecaca;"><h3>${data.task_title}</h3><p style="color: #dc2626;"><strong>Deadline:</strong> ${data.deadline}</p></div></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
        break;

      default:
        console.warn(`[${requestId}] Unknown notification type: ${type}`);
        subject = 'Notification from SLT work HuB';
        html = `${baseStyles}<div class="email-container"><div class="header"><h1>📢 Notification</h1></div><div class="content"><p>Hi ${recipient_name},</p><p>You have a new notification. Please check your dashboard for details.</p></div><div class="footer"><p class="footer-text"><span class="company-name">SLT work HuB Team</span></p></div></div>`;
    }

    console.log(`[${requestId}] Sending email with subject: ${subject}`);

    // Send email using Resend
    const { data: emailResult, error: sendError } = await resend.emails.send({
      from: "SLT work HuB <onboarding@resend.dev>",
      to: [recipient_email],
      subject: subject,
      html: html,
    });

    if (sendError) {
      console.error(`[${requestId}] Resend API error:`, sendError);
      return new Response(JSON.stringify({ 
        success: false,
        error: sendError.message || "Failed to send email",
        details: sendError,
        requestId 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`[${requestId}] Email sent successfully. Resend ID: ${emailResult?.id}`);

    // Log the email in database
    if (userProfile) {
      try {
        await supabase.from('email_notifications').insert({
          user_id: userProfile.id,
          email_type: type,
          email_to: recipient_email,
          subject: subject,
          task_id: requestData.taskId || null
        });
        console.log(`[${requestId}] Email logged to database`);
      } catch (logError) {
        console.warn(`[${requestId}] Failed to log email to database:`, logError);
        // Don't fail the request if logging fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email notification sent successfully",
      email_id: emailResult?.id,
      requestId 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "An unexpected error occurred",
      requestId 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
