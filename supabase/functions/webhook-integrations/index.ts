import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookEvent {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  source: string;
}

interface WebhookEndpoint {
  url: string;
  secret?: string;
  events: string[];
  active: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Webhook integration function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (req.method === "POST" && pathname === "/webhook-integrations/send") {
      // Send webhook to external services
      const event: WebhookEvent = await req.json();
      
      console.log("Processing webhook event:", event);

      // Get all active webhook endpoints for this event
      const { data: endpoints, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('active', true)
        .contains('events', [event.event]);

      if (error) {
        throw new Error(`Failed to fetch webhook endpoints: ${error.message}`);
      }

      const results = [];

      // Send to each endpoint
      for (const endpoint of endpoints || []) {
        try {
          const payload = {
            id: event.id,
            event: event.event,
            data: event.data,
            timestamp: event.timestamp,
            source: 'sltwork'
          };

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'SLTWork-Webhook/1.0'
          };

          // Add signature if secret is provided
          if (endpoint.secret) {
            const signature = await generateSignature(JSON.stringify(payload), endpoint.secret);
            headers['X-SLTWork-Signature'] = signature;
          }

          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });

          const success = response.ok;
          const result = {
            endpoint_id: endpoint.id,
            url: endpoint.url,
            status: response.status,
            success,
            response_time: Date.now() - new Date(event.timestamp).getTime()
          };

          results.push(result);

          // Log webhook delivery
          await supabase
            .from('webhook_deliveries')
            .insert({
              endpoint_id: endpoint.id,
              event_id: event.id,
              status_code: response.status,
              success,
              delivered_at: new Date().toISOString(),
              response_body: success ? null : await response.text()
            });

          console.log(`Webhook delivered to ${endpoint.url}:`, result);

        } catch (deliveryError) {
          console.error(`Failed to deliver webhook to ${endpoint.url}:`, deliveryError);
          
          results.push({
            endpoint_id: endpoint.id,
            url: endpoint.url,
            status: 0,
            success: false,
            error: deliveryError.message
          });

          // Log failed delivery
          await supabase
            .from('webhook_deliveries')
            .insert({
              endpoint_id: endpoint.id,
              event_id: event.id,
              status_code: 0,
              success: false,
              delivered_at: new Date().toISOString(),
              response_body: deliveryError.message
            });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Webhook sent to ${results.length} endpoints`,
        results
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (req.method === "POST" && pathname === "/webhook-integrations/register") {
      // Register new webhook endpoint
      const { url: webhookUrl, secret, events, metadata = {} } = await req.json();

      if (!webhookUrl || !events || !Array.isArray(events)) {
        return new Response(JSON.stringify({
          error: "Missing required fields: url, events"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Validate webhook URL
      try {
        new URL(webhookUrl);
      } catch {
        return new Response(JSON.stringify({
          error: "Invalid webhook URL"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Create webhook endpoint
      const { data: endpoint, error } = await supabase
        .from('webhook_endpoints')
        .insert({
          url: webhookUrl,
          secret,
          events,
          active: true,
          metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to register webhook: ${error.message}`);
      }

      console.log("Webhook endpoint registered:", endpoint);

      return new Response(JSON.stringify({
        success: true,
        message: "Webhook endpoint registered successfully",
        endpoint
      }), {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (req.method === "GET" && pathname === "/webhook-integrations/endpoints") {
      // List webhook endpoints
      const { data: endpoints, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch webhooks: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        endpoints
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (req.method === "DELETE" && pathname.startsWith("/webhook-integrations/endpoints/")) {
      // Delete webhook endpoint
      const endpointId = pathname.split('/').pop();
      
      const { error } = await supabase
        .from('webhook_endpoints')
        .delete()
        .eq('id', endpointId);

      if (error) {
        throw new Error(`Failed to delete webhook: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Webhook endpoint deleted successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (req.method === "GET" && pathname.startsWith("/webhook-integrations/deliveries/")) {
      // Get webhook delivery logs
      const endpointId = pathname.split('/').pop();
      
      const { data: deliveries, error } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('endpoint_id', endpointId)
        .order('delivered_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Failed to fetch deliveries: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        deliveries
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else {
      return new Response(JSON.stringify({
        error: "Not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error("Error in webhook-integrations function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Webhook integration failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Generate HMAC signature for webhook security
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `sha256=${hashHex}`;
}

serve(handler);