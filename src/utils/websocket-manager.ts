export interface WebSocketMessage {
  type: string;
  data?: unknown;
  timestamp?: string;
  userId?: string;
}

export interface WebSocketManagerConfig {
  userId: string;
  onMessage: (data: WebSocketMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private userId: string;
  private onMessage: (data: WebSocketMessage) => void;
  private onConnected?: () => void;
  private onDisconnected?: () => void;
  private onError?: (error: Event) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectTimeout: number | null = null;
  private heartbeatInterval: number | null = null;
  private heartbeatIntervalMs: number;
  private messageQueue: WebSocketMessage[] = [];
  private isIntentionallyClosed = false;

  constructor(config: WebSocketManagerConfig) {
    this.userId = config.userId;
    this.onMessage = config.onMessage;
    this.onConnected = config.onConnected;
    this.onDisconnected = config.onDisconnected;
    this.onError = config.onError;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 10;
    this.heartbeatIntervalMs = config.heartbeatInterval ?? 30000;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.disconnect(false);
    this.isIntentionallyClosed = false;

    const wsProtocol = globalThis.location?.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = globalThis.location?.hostname === 'localhost' 
      ? 'localhost:8816' 
      : globalThis.location?.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws?userId=${this.userId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocketManager] Connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushMessageQueue();
        if (this.onConnected) {
          this.onConnected();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;

          if (data.type === 'ping') {
            this.send({ type: 'pong', timestamp: new Date().toISOString() });
            return;
          }

          if (data.type === 'connected') {
            console.log('[WebSocketManager] Connection confirmed by server');
            return;
          }

          this.onMessage(data);
        } catch (error) {
          console.error('[WebSocketManager] Message parse error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocketManager] Disconnected');
        this.stopHeartbeat();
        
        if (this.onDisconnected) {
          this.onDisconnected();
        }

        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocketManager] Error:', error);
        if (this.onError) {
          this.onError(error);
        }
      };
    } catch (error) {
      console.error('[WebSocketManager] Connection failed:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(intentional = true): void {
    this.isIntentionallyClosed = intentional;
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (error) {
        console.error('[WebSocketManager] Error closing connection:', error);
      }
      this.ws = null;
    }
  }

  send(data: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('[WebSocketManager] Send error:', error);
        this.messageQueue.push(data);
      }
    } else {
      this.messageQueue.push(data);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): number | null {
    return this.ws?.readyState ?? null;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() });
      }
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketManager] Max reconnect attempts reached');
      return;
    }

    const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;

    console.log(`[WebSocketManager] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }
}
