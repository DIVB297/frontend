import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import { ChatMessage, SearchResult, ApiError } from '../types';

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  sources: SearchResult[];
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => Promise<void>;
  resetSession: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
  }, []);

  // Join session room when sessionId changes
  useEffect(() => {
    if (sessionId) {
      socketService.joinSession(sessionId);
      loadHistory();
    }
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
  };

  const loadHistory = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await apiService.getChatHistory(sessionId);
      const historyMessages = response.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(historyMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't set error state for history loading failures
    }
  }, [sessionId]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading || !sessionId) return;

    setLoading(true);
    setError(null);
    setSources([]);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sessionId,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await apiService.sendMessage(content.trim(), sessionId);
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: response.messageId,
        sessionId: response.sessionId,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Set sources if available
      if (response.sources && response.sources.length > 0) {
        setSources(response.sources);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Remove the user message that failed to send
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      const apiError = error as ApiError;
      setError(apiError.error || 'Failed to send message');
    } finally {
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