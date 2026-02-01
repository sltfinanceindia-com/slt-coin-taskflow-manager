import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash OTP for secure storage using SHA-256
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(new Uint8Array(hashBuffer));
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, action } = await req.json();
    console.log(`OTP request for email: ${email}, action: ${action}`);

    if (action === 'send') {
      // Check if email exists in profiles (registered users only)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_active')
        .eq('email', email.toLowerCase())
        .single();

      if (profileError || !profile) {
        console.log('Email not found in registered users:', email);
        return new Response(JSON.stringify({
          success: false,
          error: 'This email is not registered. Please contact your administrator.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (!profile.is_active) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Your account is deactivated. Please contact your administrator.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Generate OTP and store it with expiry (5 minutes)
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP in a simple key-value format using the profiles table metadata
      // We'll use a separate table or use Supabase Auth's built-in magic link
      // For now, use the auth.signInWithOtp with custom email template

      // Send OTP via email
      const emailResponse = await resend.emails.send({
        from: 'SLT work HuB <onboarding@resend.dev>',
        to: [email],
        subject: `🔐 Your OTP Code: ${otp}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🔐 OTP Verification</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Your one-time password</p>
            </div>
            <div style="padding: 32px 24px; line-height: 1.6; color: #374151;">
              <p style="font-size: 18px; margin-bottom: 20px; color: #1f2937;">Hello ${profile.full_name || 'User'},</p>
              <p>Use this code to sign in to your SLT work HuB account:</p>
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-size: 32px; font-weight: 700; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; letter-spacing: 8px;">
                ${otp}
              </div>
              <p style="color: #dc2626; font-weight: 600;">⚠️ This code expires in 5 minutes.</p>
              <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Secure login powered by<br><span style="color: #2563eb; font-weight: 600;">SLT Finance India</span></p>
            </div>
          </div>
        `
      });

      console.log('OTP email sent:', emailResponse);

      // Hash OTP for secure storage
      const hashedOTP = await hashOTP(otp);
      
      // Store hashed OTP in database
      const { error: insertError } = await supabase
        .from('otp_codes')
        .upsert({
          email: email.toLowerCase(),
          otp_hash: hashedOTP, // Stored as SHA-256 hash
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }, { onConflict: 'email' });

      if (insertError) {
        console.error('Error storing OTP:', insertError);
        // Continue anyway - edge function still sends email
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        expiresAt: expiresAt.toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } else if (action === 'verify') {
      const { otp } = await req.json();
      
      // Verify OTP from storage
      const { data: otpRecord, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (otpError || !otpRecord) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No OTP found. Please request a new one.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Check expiry
      if (new Date(otpRecord.expires_at) < new Date()) {
        return new Response(JSON.stringify({
          success: false,
          error: 'OTP has expired. Please request a new one.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Hash the submitted OTP and compare with stored hash
      const hashedSubmittedOTP = await hashOTP(otp);
      if (otpRecord.otp_hash !== hashedSubmittedOTP) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid OTP. Please try again.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // OTP verified - delete it
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', email.toLowerCase());

      // Generate a magic link or session token
      // Use Supabase Auth's admin API to sign in the user
      const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email.toLowerCase(),
        options: {
          redirectTo: `${req.headers.get('origin')}/dashboard`
        }
      });

      if (authError) {
        console.error('Error generating magic link:', authError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to create session. Please try again.'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'OTP verified successfully',
        magicLink: authData.properties?.action_link
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('OTP error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
