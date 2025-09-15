import axios, { AxiosResponse } from 'axios';
import { ChatResponse, ChatMessage, ChatSession, ApiError } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Chat endpoints
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
      const response: AxiosResponse<ChatResponse> = await axios.post(
        `${this.baseURL}/chat/message`,
        { message, sessionId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Server-sent events for streaming
  createStreamConnection(
    message: string,
    sessionId?: string,
    onEvent?: (event: any) => void
  ): EventSource {
    const url = new URL(`${this.baseURL}/chat/message/stream`);
    
    // Create a POST request with SSE
    const eventSource = new EventSource(url);
    
    // Send the message via POST first
    this.sendStreamMessage(message, sessionId);

    eventSource.onmessage = (event) => {
      if (onEvent) {
        try {
          const data = JSON.parse(event.data);
          onEvent(data);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return eventSource;
  }

  private async sendStreamMessage(message: string, sessionId?: string): Promise<void> {
    await axios.post(
      `${this.baseURL}/chat/message/stream`,
      { message, sessionId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  async getChatHistory(sessionId: string, limit: number = 20): Promise<{ messages: ChatMessage[]; count: number }> {
    try {
      const response = await axios.get(`${this.baseURL}/chat/history/${sessionId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Session endpoints
  async createSession(): Promise<{ sessionId: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/sessions/create`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSessionInfo(sessionId: string): Promise<{ session: ChatSession }> {
    try {
      const response = await axios.get(`${this.baseURL}/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/sessions/${sessionId}/clear`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/sessions/${sessionId}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async validateSession(sessionId: string): Promise<{ valid: boolean }> {
    try {
      const response = await axios.get(`${this.baseURL}/sessions/${sessionId}/validate`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Health check
  async getHealth(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    if (error.response?.data) {
      return error.response.data;
    } else if (error.message) {
      return { error: error.message };
    } else {
      return { error: 'An unknown error occurred' };
    }
  }
}

export const apiService = new ApiService();
