import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  type: 'message' | 'mention' | 'channel_invite' | 'task_assignment' | 'deadline_reminder';
  recipient_email: string;
  recipient_name: string;
  data: {
    sender_name?: string;
    channel_name?: string;
    message_content?: string;
    task_title?: string;
    deadline?: string;
    url?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Email notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, recipient_email, recipient_name, data }: EmailNotificationRequest = await req.json();

    console.log("Processing email notification:", { type, recipient_email, data });

    // Check if user has email notifications enabled
    const { data: notificationSettings } = await supabase
      .from('notification_settings')
      .select('email_notifications')
      .eq('user_id', data.url) // This should be user_id, but using url as placeholder
      .single();

    if (notificationSettings && !notificationSettings.email_notifications) {
      console.log("Email notifications disabled for user");
      return new Response(JSON.stringify({ message: "Email notifications disabled" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check daily email limits
    const today = new Date().toISOString().split('T')[0];
    const { data: emailLog, error: logError } = await supabase
      .from('daily_email_log')
      .select('sent_count')
      .eq('user_id', data.url) // This should be user_id
      .eq('email_type', type)
      .eq('email_date', today)
      .single();

    if (emailLog && emailLog.sent_count >= 10) { // Daily limit
      console.log("Daily email limit reached");
      return new Response(JSON.stringify({ message: "Daily email limit reached" }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate email content based on type
    let subject = "";
    let html = "";

    switch (type) {
      case 'message':
        subject = `New message from ${data.sender_name} in ${data.channel_name}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Message</h2>
            <p>Hi ${recipient_name},</p>
            <p><strong>${data.sender_name}</strong> sent a message in <strong>${data.channel_name}</strong>:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;">${data.message_content}</p>
            </div>
            <a href="${data.url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Message</a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You received this email because you have notifications enabled. 
              <a href="${data.url}/settings">Manage your notification preferences</a>
            </p>
          </div>
        `;
        break;

      case 'mention':
        subject = `You were mentioned by ${data.sender_name}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You were mentioned!</h2>
            <p>Hi ${recipient_name},</p>
            <p><strong>${data.sender_name}</strong> mentioned you in <strong>${data.channel_name}</strong>:</p>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;">${data.message_content}</p>
            </div>
            <a href="${data.url}" style="background: #ffc107; color: #212529; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Mention</a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You received this email because you were mentioned. 
              <a href="${data.url}/settings">Manage your notification preferences</a>
            </p>
          </div>
        `;
        break;

      case 'channel_invite':
        subject = `You've been invited to join ${data.channel_name}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Channel Invitation</h2>
            <p>Hi ${recipient_name},</p>
            <p><strong>${data.sender_name}</strong> has invited you to join the <strong>${data.channel_name}</strong> channel.</p>
            <a href="${data.url}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Join Channel</a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You received this email because you were invited to a channel. 
              <a href="${data.url}/settings">Manage your notification preferences</a>
            </p>
          </div>
        `;
        break;

      case 'task_assignment':
        subject = `New task assigned: ${data.task_title}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Task Assignment</h2>
            <p>Hi ${recipient_name},</p>
            <p>You have been assigned a new task:</p>
            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">${data.task_title}</h3>
              ${data.deadline ? `<p style="margin: 0; color: #666;"><strong>Deadline:</strong> ${data.deadline}</p>` : ''}
            </div>
            <a href="${data.url}" style="background: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Task</a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You received this email because a task was assigned to you. 
              <a href="${data.url}/settings">Manage your notification preferences</a>
            </p>
          </div>
        `;
        break;

      case 'deadline_reminder':
        subject = `Reminder: ${data.task_title} deadline approaching`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Deadline Reminder</h2>
            <p>Hi ${recipient_name},</p>
            <p>This is a reminder that your task deadline is approaching:</p>
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">${data.task_title}</h3>
              <p style="margin: 0; color: #721c24;"><strong>Deadline:</strong> ${data.deadline}</p>
            </div>
            <a href="${data.url}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Task</a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You received this email because of an upcoming deadline. 
              <a href="${data.url}/settings">Manage your notification preferences</a>
            </p>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "SLT Work <notifications@sltwork.com>",
      to: [recipient_email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email send in database
    const { error: insertError } = await supabase
      .from('email_notifications')
      .insert({
        user_id: data.url, // This should be the actual user_id
        email_type: type,
        email_to: recipient_email,
        subject: subject,
        sent_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Failed to log email notification:", insertError);
    }

    // Update daily email log
    const { error: updateError } = await supabase
      .from('daily_email_log')
      .upsert({
        user_id: data.url, // This should be the actual user_id
        email_type: type,
        email_date: today,
        sent_count: (emailLog?.sent_count || 0) + 1
      });

    if (updateError) {
      console.error("Failed to update daily email log:", updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email notification sent successfully",
      email_id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in email-notifications function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send email notification"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);