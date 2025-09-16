export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
}

export interface SearchResult {
  articleId: string;
  content: string;
  score: number;
  metadata: {
    title?: string;
    url?: string;
    source?: string;
    publishedAt?: string;
    [key: string]: any;
  };
}

export interface ChatResponse {
  sessionId: string;
  message: ChatMessage;
  sources?: SearchResult[];
  response: string;
  messageId: string;
}

export interface StreamEvent {
  type: 'session' | 'sources' | 'chunk' | 'complete' | 'error';
  sessionId?: string;
  sources?: SearchResult[];
  content?: string;
  messageId?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: any[];
  message?: string;
}

export interface NewsStatus {
  lastUpdate: string | null;
  lastUpdateFormatted: string;
  nextUpdate: string | null;
  nextUpdateFormatted: string;
  documentCount: number;
  cronEnabled: boolean;
  cronInterval: number;
  cronIntervalFormatted: string;
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    isRunning: boolean;
    lastRunAt: string | null;
    lastSuccessAt: string | null;
    lastErrorAt: string | null;
  };
}
