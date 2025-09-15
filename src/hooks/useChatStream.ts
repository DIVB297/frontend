import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import { ChatMessage, SearchResult, ApiError } from '../types';

interface StreamingMessage extends ChatMessage {
  isStreaming?: boolean;
  streamComplete?: boolean;
}

interface UseChatStreamReturn {
  messages: StreamingMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  sources: SearchResult[];
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => Promise<void>;
  resetSession: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

export const useChatStream = (): UseChatStreamReturn => {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sources, setSources] = useState<SearchResult[]>([]);

  // Initialize session and socket connection
  useEffect(() => {
    initializeSession();
    initializeSocket();
    
    return () => {
      socketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join session room when sessionId changes
  useEffect(() => {
    if (sessionId) {
      socketService.joinSession(sessionId);
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      // Check if there's a stored session ID
      const storedSessionId = localStorage.getItem('chatSessionId');
      
      if (storedSessionId) {
        // Validate the stored session
        const validation = await apiService.validateSession(storedSessionId);
        if (validation.valid) {
          setSessionId(storedSessionId);
          return;
        } else {
          localStorage.removeItem('chatSessionId');
        }
      }
      
      // Create new session
      const response = await apiService.createSession();
      setSessionId(response.sessionId);
      localStorage.setItem('chatSessionId', response.sessionId);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setError('Failed to initialize chat session');
    }
  };

  const initializeSocket = () => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setError(null);
    });
    
    socket.on('disconnect', () => {
      setError('Connection lost. Trying to reconnect...');
    });
    
    socket.on('connect_error', () => {
      setError('Failed to connect to server');
    });

    // Set up streaming event handlers
    setupStreamingHandlers();
  };

  const setupStreamingHandlers = () => {
    // Handle session updates
    socketService.onStreamSession((data) => {
      setSessionId(data.sessionId);
      localStorage.setItem('chatSessionId', data.sessionId);
    });

    // Handle user message confirmation
    socketService.onStreamUserMessage((data) => {
      const userMessage: StreamingMessage = {
        id: data.messageId,
        sessionId: sessionId!,
        role: 'user',
        content: data.content,
        timestamp: new Date(data.timestamp),
      };
      setMessages(prev => [...prev, userMessage]);
    });

    // Handle sources
    socketService.onStreamSources((data) => {
      setSources(data.sources);
    });

    // Handle stream start
    socketService.onStreamStart((data) => {
      const assistantMessage: StreamingMessage = {
        id: data.messageId,
        sessionId: sessionId!,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        streamComplete: false,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    });

    // Handle stream chunks
    socketService.onStreamChunk((data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: msg.content + data.content }
          : msg
      ));
    });

    // Handle stream completion
    socketService.onStreamComplete((data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { 
              ...msg, 
              timestamp: new Date(data.timestamp),
              isStreaming: false,
              streamComplete: true 
            }
          : msg
      ));
    });

    // Handle stream errors
    socketService.onStreamError((data) => {
      setError(data.error);
      setLoading(false);
      console.error('Streaming error:', data.details);
    });
  };

  const loadHistory = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await apiService.getChatHistory(sessionId);
      const historyMessages: StreamingMessage[] = response.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        streamComplete: true, // Historical messages are always complete
      }));
      setMessages(historyMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't set error state for history loading failures
    }
  }, [sessionId]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    setSources([]);

    try {
      // Send message via socket for streaming
      socketService.sendMessageStream(content.trim(), sessionId || undefined);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!sessionId) return;
    try {
      await apiService.clearSession(sessionId);
      setMessages([]);
      setSources([]);
      setError(null);
    } catch (error) {
      console.error('Failed to clear chat:', error);
      const apiError = error as ApiError;
      setError(apiError.error || 'Failed to clear chat');
    }
  };

  const resetSession = async () => {
    try {
      // Leave current session
      if (sessionId) {
        socketService.leaveSession(sessionId);
      }
      
      // Clear local state
      setMessages([]);
      setSources([]);
      setError(null);
      setSessionId(null);
      localStorage.removeItem('chatSessionId');
      
      // Create new session
      await initializeSession();
    } catch (error) {
      console.error('Failed to reset session:', error);
      const apiError = error as ApiError;
      setError(apiError.error || 'Failed to reset session');
    }
  };

  return {
    messages,
    loading,
    error,
    sessionId,
    sources,
    sendMessage,
    clearChat,
    resetSession,
    loadHistory,
  };
};
