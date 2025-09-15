import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.connected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinSession(sessionId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('join-session', sessionId);
    }
  }

  leaveSession(sessionId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('leave-session', sessionId);
    }
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Streaming chat methods
  sendMessageStream(message: string, sessionId?: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('send-message-stream', { message, sessionId });
    }
  }

  // Streaming event listeners
  onStreamSession(callback: (data: { sessionId: string }) => void): void {
    if (this.socket) {
      this.socket.on('stream-session', callback);
    }
  }

  onStreamUserMessage(callback: (data: { messageId: string; content: string; timestamp: Date }) => void): void {
    if (this.socket) {
      this.socket.on('stream-user-message', callback);
    }
  }

  onStreamSources(callback: (data: { sources: any[] }) => void): void {
    if (this.socket) {
      this.socket.on('stream-sources', callback);
    }
  }

  onStreamStart(callback: (data: { messageId: string }) => void): void {
    if (this.socket) {
      this.socket.on('stream-start', callback);
    }
  }

  onStreamChunk(callback: (data: { messageId: string; content: string }) => void): void {
    if (this.socket) {
      this.socket.on('stream-chunk', callback);
    }
  }

  onStreamComplete(callback: (data: { messageId: string; timestamp: Date }) => void): void {
    if (this.socket) {
      this.socket.on('stream-complete', callback);
    }
  }

  onStreamError(callback: (data: { error: string; details?: string }) => void): void {
    if (this.socket) {
      this.socket.on('stream-error', callback);
    }
  }

  // Event listeners
  onMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }

  onTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove listeners
  off(event: string, callback?: Function): void {
    if (this.socket) {
      this.socket.off(event, callback as any);
    }
  }
}

export const socketService = new SocketService();
