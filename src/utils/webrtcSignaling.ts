// WebRTC Signaling Client using WebSocket
export class WebRTCSignaling {
  private ws: WebSocket | null = null;
  private userId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageHandlers = new Map<string, (data: any) => void>();

  constructor(userId: string) {
    this.userId = userId;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `wss://orybzmkhccrqmjuvioln.supabase.co/functions/v1/webrtc-signal`;
    console.log('Connecting to WebRTC signaling server...');
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebRTC signaling connected');
      this.reconnectAttempts = 0;
      
      // Register with server
      this.send({
        type: 'call-init',
        fromUserId: this.userId,
        toUserId: '',
        data: {}
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received signaling message:', message.type);
        
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        console.error('Error handling signaling message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebRTC signaling error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebRTC signaling closed');
      this.ws = null;
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  on(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  off(type: string) {
    this.messageHandlers.delete(type);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}