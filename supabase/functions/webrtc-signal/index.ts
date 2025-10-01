import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-init' | 'call-end';
  fromUserId: string;
  toUserId: string;
  data: any;
  callId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle WebSocket upgrade
  if (upgradeHeader.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let userId: string | null = null;
    const connectedUsers = new Map<string, WebSocket>();

    socket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    socket.onmessage = async (event) => {
      try {
        const message: SignalMessage = JSON.parse(event.data);
        console.log("Received message:", message.type);

        // Register user connection
        if (message.type === 'call-init') {
          userId = message.fromUserId;
          connectedUsers.set(userId, socket);
          console.log(`User ${userId} connected`);
          
          // Send acknowledgment
          socket.send(JSON.stringify({ type: 'connected', userId }));
          return;
        }

        // Handle call end
        if (message.type === 'call-end') {
          // Forward to recipient
          const recipientSocket = connectedUsers.get(message.toUserId);
          if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
            recipientSocket.send(JSON.stringify(message));
          }
          
          // Update call history
          if (message.callId) {
            await supabase
              .from('call_history')
              .update({
                status: 'completed',
                ended_at: new Date().toISOString()
              })
              .eq('id', message.callId);
          }
          return;
        }

        // Forward signaling messages (offer, answer, ice-candidate)
        const recipientSocket = connectedUsers.get(message.toUserId);
        if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
          recipientSocket.send(JSON.stringify(message));
          console.log(`Forwarded ${message.type} to ${message.toUserId}`);
        } else {
          console.log(`Recipient ${message.toUserId} not connected`);
          
          // If recipient is not online, mark call as missed
          if (message.type === 'offer' && message.callId) {
            await supabase
              .from('call_history')
              .update({
                status: 'no_answer',
                ended_at: new Date().toISOString()
              })
              .eq('id', message.callId);
              
            // Send error back to caller
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Recipient is offline',
              callId: message.callId
            }));
          }
        }
      } catch (error) {
        console.error("Error handling message:", error);
        socket.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    };

    socket.onclose = () => {
      if (userId) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return response;
  }

  // Handle regular HTTP requests (health check)
  return new Response(
    JSON.stringify({ message: "WebRTC Signaling Server", status: "running" }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});