import { config } from '../config/environment';
import { WebSocketMessage, VoiceStreamData } from '../types/api';

type WebSocketEventHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;
  private isInitialized = false;

  constructor() {
    // Don't connect immediately - wait for explicit call
  }

  private initialize(): void {
    if (this.isInitialized) return;
    
    // Only initialize if not using mock data
    if (!config.enableMockData) {
      this.connect();
    }
    
    this.isInitialized = true;
  }

  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Don't connect if using mock data
    if (config.enableMockData) {
      console.log('WebSocket: Using mock data, skipping connection');
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(config.websocketURL);
      
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private onOpen(): void {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    // Send authentication if needed
    if (config.apiKey) {
      this.send({
        type: 'auth',
        data: { token: config.apiKey },
        timestamp: new Date().toISOString(),
      });
    }

    this.emit('connected', null);
  }

  private onMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.emit(message.type, message.data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private onClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnecting = false;
    this.ws = null;
    
    this.emit('disconnected', { code: event.code, reason: event.reason });

    if (this.shouldReconnect && event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private onError(error: Event): void {
    console.error('WebSocket error:', error);
    this.isConnecting = false;
    this.emit('error', error);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnectFailed', null);
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.shouldReconnect && !config.enableMockData) {
        this.connect();
      }
    }, delay);
  }

  // Event handling
  public on(event: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  // Public methods
  public send(message: WebSocketMessage): void {
    this.initialize(); // Ensure service is initialized
    
    if (config.enableMockData) {
      console.log('WebSocket: Mock mode, not sending message');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  public startVoiceStream(sessionId: string): void {
    this.send({
      type: 'voice_start',
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  public sendVoiceData(sessionId: string, audioData: ArrayBuffer): void {
    // Convert ArrayBuffer to base64
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData)));
    
    this.send({
      type: 'voice_data',
      sessionId,
      data: { audio: base64Audio },
      timestamp: new Date().toISOString(),
    });
  }

  public endVoiceStream(sessionId: string): void {
    this.send({
      type: 'voice_end',
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  public isConnected(): boolean {
    if (config.enableMockData) {
      return true; // Pretend we're connected in mock mode
    }
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
    }
  }

  public reconnect(): void {
    if (config.enableMockData) {
      console.log('WebSocket: Mock mode, no need to reconnect');
      return;
    }

    this.disconnect();
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 100);
  }

  // Initialize on first use
  public ensureInitialized(): void {
    this.initialize();
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// Export class for testing
export { WebSocketService };