import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PhonePe UAT/Test URLs
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

interface PaymentInitRequest {
  amount: number; // Amount in paise
  merchantTransactionId: string;
  merchantUserId: string;
  redirectUrl: string;
  callbackUrl: string;
}

interface PaymentStatusRequest {
  merchantTransactionId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const phonepeClientId = Deno.env.get('PHONEPE_CLIENT_ID');
    const phonepeClientSecret = Deno.env.get('PHONEPE_CLIENT_SECRET');

    if (!phonepeClientId || !phonepeClientSecret) {
      console.error('PhonePe credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // Create Supabase client
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    });

    if (action === 'initiate' && req.method === 'POST') {
      // Initiate payment
      const body: PaymentInitRequest = await req.json();
      
      const { amount, merchantTransactionId, merchantUserId, redirectUrl, callbackUrl } = body;

      if (!amount || !merchantTransactionId || !merchantUserId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: amount, merchantTransactionId, merchantUserId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create payment payload for PhonePe
      const payload = {
        merchantId: phonepeClientId,
        merchantTransactionId,
        merchantUserId,
        amount, // Amount in paise (e.g., 100 = ₹1)
        redirectUrl: redirectUrl || `${url.origin}/payment/callback`,
        redirectMode: 'POST',
        callbackUrl: callbackUrl || `${url.origin}/functions/v1/phonepe-payment/callback`,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // Encode payload to Base64
      const payloadBase64 = btoa(JSON.stringify(payload));
      
      // Create checksum
      // For PhonePe, checksum = sha256(base64EncodedPayload + "/pg/v1/pay" + saltKey) + "###" + saltIndex
      // Note: In test mode, we'll use a simplified approach
      const encoder = new TextEncoder();
      const data = encoder.encode(payloadBase64 + '/pg/v1/pay' + phonepeClientSecret);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + '###1';

      console.log('Initiating PhonePe payment for transaction:', merchantTransactionId);

      // Make request to PhonePe
      const phonepeResponse = await fetch(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        body: JSON.stringify({
          request: payloadBase64
        })
      });

      const phonepeData = await phonepeResponse.json();
      console.log('PhonePe response:', JSON.stringify(phonepeData));

      if (phonepeData.success) {
        return new Response(
          JSON.stringify({
            success: true,
            data: phonepeData.data,
            redirectUrl: phonepeData.data?.instrumentResponse?.redirectInfo?.url
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            error: phonepeData.message || 'Payment initiation failed',
            code: phonepeData.code
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } else if (action === 'status' && req.method === 'POST') {
      // Check payment status
      const body: PaymentStatusRequest = await req.json();
      const { merchantTransactionId } = body;

      if (!merchantTransactionId) {
        return new Response(
          JSON.stringify({ error: 'merchantTransactionId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create checksum for status check
      const statusPath = `/pg/v1/status/${phonepeClientId}/${merchantTransactionId}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(statusPath + phonepeClientSecret);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + '###1';

      console.log('Checking payment status for:', merchantTransactionId);

      const statusResponse = await fetch(`${PHONEPE_BASE_URL}${statusPath}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': phonepeClientId,
        }
      });

      const statusData = await statusResponse.json();
      console.log('PhonePe status response:', JSON.stringify(statusData));

      return new Response(
        JSON.stringify(statusData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'callback' && req.method === 'POST') {
      // Handle callback from PhonePe
      const body = await req.json();
      console.log('PhonePe callback received:', JSON.stringify(body));

      // Verify the callback (decode response)
      if (body.response) {
        try {
          const decodedResponse = JSON.parse(atob(body.response));
          console.log('Decoded callback:', JSON.stringify(decodedResponse));

          // Store payment result in database if needed
          // You can update your payments table here

          return new Response(
            JSON.stringify({ success: true, data: decodedResponse }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (e) {
          console.error('Error decoding callback:', e);
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid action. Use /initiate, /status, or /callback',
          availableActions: ['initiate', 'status', 'callback']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in phonepe-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
