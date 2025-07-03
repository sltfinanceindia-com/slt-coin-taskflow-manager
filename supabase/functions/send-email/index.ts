
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  emailType: 'task_assigned' | 'task_completed' | 'comment_added' | 'coins_earned' | 'login_notification' | 'logout_notification';
  to: string;
  recipientName: string;
  taskTitle?: string;
  taskId?: string;
  commentId?: string;
  coinAmount?: number;
  assignerName?: string;
  commenterName?: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const getEmailTemplate = (data: EmailRequest) => {
  const { emailType, recipientName, taskTitle, coinAmount, assignerName, commenterName } = data;
  
  const baseStyles = `
    <style>
      .email-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        padding: 32px 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .header p {
        margin: 8px 0 0 0;
        opacity: 0.9;
        font-size: 16px;
      }
      .content {
        padding: 32px 24px;
        line-height: 1.6;
        color: #374151;
      }
      .greeting {
        font-size: 18px;
        margin-bottom: 20px;
        color: #1f2937;
      }
      .highlight-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin: 24px 0;
      }
      .task-title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }
      .coins-earned {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        font-size: 24px;
        font-weight: 700;
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        margin: 20px 0;
      }
      .footer {
        background: #f9fafb;
        padding: 24px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }
      .footer-text {
        color: #6b7280;
        font-size: 14px;
        margin: 0;
      }
      .company-name {
        color: #2563eb;
        font-weight: 600;
      }
      .cta-button {
        display: inline-block;
        background: #2563eb;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        margin: 20px 0;
      }
    </style>
  `;
  
  switch (emailType) {
    case 'task_assigned':
      return {
        subject: `📋 New Task Assigned: ${taskTitle}`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>🎯 New Task Assigned</h1>
              <p>You have a new task to work on</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${recipientName},</p>
              <p>Great news! ${assignerName} has assigned you a new task. We're confident you'll do an excellent job!</p>
              <div class="highlight-box">
                <h3 class="task-title">📋 ${taskTitle}</h3>
              </div>
              <p>Please log in to your dashboard to view the complete task details and start working on it. Remember, every completed task brings you closer to earning valuable SLT Coins!</p>
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Review the task requirements carefully</li>
                <li>Set realistic timelines for completion</li>
                <li>Reach out if you need any clarification</li>
              </ul>
            </div>
            <div class="footer">
              <p class="footer-text">Keep up the great work!<br><span class="company-name">SLT Finance India Team</span></p>
            </div>
          </div>
        `
      };

    case 'task_completed':
      return {
        subject: `✅ Task Completed: ${taskTitle}`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>✅ Task Completed</h1>
              <p>Ready for your review</p>
            </div>
            <div class="content">
              <p class="greeting">Hello Admin,</p>
              <p>Excellent news! ${recipientName} has successfully completed a task and it's now ready for your review.</p>
              <div class="highlight-box">
                <h3 class="task-title">✅ ${taskTitle}</h3>
                <p style="margin: 8px 0 0 0; color: #16a34a; font-weight: 600;">Status: Completed & Awaiting Review</p>
              </div>
              <p>Please review the task submission and provide your feedback. Once approved, the intern will receive their well-deserved SLT Coins!</p>
              <p><strong>Review Checklist:</strong></p>
              <ul>
                <li>Check task completion against requirements</li>
                <li>Review quality of work delivered</li>
                <li>Provide constructive feedback if needed</li>
                <li>Approve and award SLT Coins</li>
              </ul>
            </div>
            <div class="footer">
              <p class="footer-text">Excellence in action!<br><span class="company-name">SLT Finance India System</span></p>
            </div>
          </div>
        `
      };

    case 'comment_added':
      return {
        subject: `💬 New Comment: ${taskTitle}`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>💬 New Comment Added</h1>
              <p>Someone has shared an update</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${recipientName},</p>
              <p>${commenterName} has added a new comment to one of your tasks. Stay in the loop with the latest updates!</p>
              <div class="highlight-box">
                <h3 class="task-title">💬 ${taskTitle}</h3>
                <p style="margin: 8px 0 0 0; color: #7c3aed; font-weight: 600;">New comment from ${commenterName}</p>
              </div>
              <p>Please check the task to see the latest updates and respond if needed. Effective communication is key to successful project completion!</p>
              <p><strong>Stay Connected:</strong></p>
              <ul>
                <li>Check the comment for important updates</li>
                <li>Respond promptly if action is required</li>
                <li>Keep the conversation productive</li>
              </ul>
            </div>
            <div class="footer">
              <p class="footer-text">Great teamwork!<br><span class="company-name">SLT Finance India Team</span></p>
            </div>
          </div>
        `
      };

    case 'coins_earned':
      return {
        subject: `🪙 Congratulations! You've Earned ${coinAmount} SLT Coins!`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>You've earned SLT Coins for your excellent work</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${recipientName},</p>
              <p>Outstanding work! Your dedication and effort have paid off. We're thrilled to reward your excellence!</p>
              <div class="coins-earned">
                🪙 ${coinAmount} SLT Coins Earned!
              </div>
              <div class="highlight-box">
                <h3 class="task-title">🏆 ${taskTitle}</h3>
                <p style="margin: 8px 0 0 0; color: #16a34a; font-weight: 600;">Task Status: Verified & Approved</p>
              </div>
              <p>Your total SLT Coins have been updated in your profile. Keep up this excellent momentum – every coin represents your growth and contribution to our team!</p>
              <p><strong>Keep Building Success:</strong></p>
              <ul>
                <li>Track your coin balance in your profile</li>
                <li>Maintain this high standard of work</li>
                <li>Look forward to more rewarding opportunities</li>
              </ul>
            </div>
            <div class="footer">
              <p class="footer-text">Excellence rewarded!<br><span class="company-name">SLT Finance India Team</span></p>
            </div>
          </div>
        `
      };

    case 'login_notification':
      return {
        subject: `🔐 Welcome Back to SLT Finance India`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>🔐 Welcome Back!</h1>
              <p>Secure login notification</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${recipientName},</p>
              <p>You have successfully logged into your SLT Finance India account. We're glad to have you back!</p>
              <div class="highlight-box">
                <p><strong>Login Details:</strong></p>
                <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Successful</span></p>
              </div>
              <p>If this login wasn't initiated by you, please contact your administrator immediately for security assistance.</p>
              <p><strong>Security Reminder:</strong></p>
              <ul>
                <li>Always log out when using shared devices</li>
                <li>Use strong, unique passwords</li>
                <li>Report any suspicious activity immediately</li>
              </ul>
            </div>
            <div class="footer">
              <p class="footer-text">Your security is our priority<br><span class="company-name">SLT Finance India Security Team</span></p>
            </div>
          </div>
        `
      };

    case 'logout_notification':
      return {
        subject: `👋 Logged Out from SLT Finance India`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>👋 See You Soon!</h1>
              <p>Logout notification</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${recipientName},</p>
              <p>You have successfully logged out of your SLT Finance India account. Thank you for another productive session!</p>
              <div class="highlight-box">
                <p><strong>Logout Details:</strong></p>
                <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Successful</span></p>
              </div>
              <p>We appreciate your hard work and dedication. Looking forward to seeing you back soon for more productive collaboration!</p>
              <p><strong>Until Next Time:</strong></p>
              <ul>
                <li>Keep up the excellent work momentum</li>
                <li>Stay tuned for new opportunities</li>
                <li>Remember, every task is a step toward growth</li>
              </ul>
            </div>
            <div class="footer">
              <p class="footer-text">Thank you for your dedication!<br><span class="company-name">SLT Finance India Team</span></p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: 'Notification from SLT Finance India',
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1>📢 Notification</h1>
              <p>Important update for you</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${recipientName},</p>
              <p>You have received a new notification from SLT Finance India. Please check your dashboard for more details.</p>
            </div>
            <div class="footer">
              <p class="footer-text">Stay connected!<br><span class="company-name">SLT Finance India Team</span></p>
            </div>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    console.log('Sending email via Resend:', emailData);

    const template = getEmailTemplate(emailData);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'SLT Finance India <info@sltfinanceindia.com>',
      to: [emailData.to],
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent successfully via Resend:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully via Resend',
      id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error sending email via Resend:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
