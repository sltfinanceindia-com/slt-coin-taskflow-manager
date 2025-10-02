import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Store active connections
const connections = new Map<string, WebSocket>();

Deno.serve(async (req) => {
  const upgrade = req.headers.get('upgrade') || '';
  
  if (upgrade.toLowerCase() !== 'websocket') {
    return new Response("Request isn't trying to upgrade to WebSocket.", {
      status: 400
    });
  }

  // Extract and verify JWT from query params
  const url = new URL(req.url);
  const jwt = url.searchParams.get('jwt');
  const userId = url.searchParams.get('userId');

  if (!jwt) {
    console.error('Auth token not provided');
    return new Response('Auth token not provided', { status: 403 });
  }

  // Verify user authentication
  const { data, error } = await supabase.auth.getUser(jwt);
  
  if (error || !data.user) {
    console.error('Authentication failed:', error);
    return new Response('Invalid token provided', { status: 403 });
  }

  console.log(`User ${data.user.id} connected`);

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  socket.onopen = () => {
    console.log(`Socket opened for user ${data.user.id}`);
    connections.set(data.user.id, socket);
    
    // Send connection confirmation
    socket.send(JSON.stringify({
      type: 'connected',
      userId: data.user.id
    }));
  };

  socket.onmessage = (e) => {
    try {
      const message = JSON.parse(e.data);
      console.log(`Received message type: ${message.type}`);
      
      // Handle different message types
      switch (message.type) {
        case 'register':
          console.log(`User ${message.userId} registered`);
          break;
          
        case 'call-init':
        case 'call-offer':
        case 'call-answer':
        case 'ice-candidate':
          // Forward signaling messages to target user
          const targetSocket = connections.get(message.toUserId);
          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(JSON.stringify({
              ...message,
              fromUserId: data.user.id
            }));
          } else {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Target user not connected'
            }));
          }
          break;
          
        case 'call-end':
          const endTargetSocket = connections.get(message.toUserId);
          if (endTargetSocket) {
            endTargetSocket.send(JSON.stringify(message));
          }
          break;
          
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  };

  socket.onerror = (e) => {
    console.error('Socket error:', e);
  };

  socket.onclose = () => {
    console.log(`Socket closed for user ${data.user.id}`);
    connections.delete(data.user.id);
  };

  return response;
});
