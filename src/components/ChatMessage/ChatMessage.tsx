import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import ReactMarkdown from 'react-markdown';
import './ChatMessage.scss';

interface StreamingMessage extends ChatMessageType {
  isStreaming?: boolean;
  streamComplete?: boolean;
}

interface ChatMessageProps {
  message: StreamingMessage;
  isLatest?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest }) => {
  const formatTime = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`chat-message ${message.role} ${isLatest ? 'latest' : ''}`}>
      <div className="message-avatar">
        {message.role === 'user' ? (
          <div className="user-avatar">You</div>
        ) : (
          <div className="assistant-avatar">🤖</div>
        )}
      </div>
      
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">
            {message.role === 'user' ? 'You' : 'AI Assistant'}
          </span>
          <span className="message-time">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        <div className="message-text">
          {message.role === 'assistant' ? (
            <>
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {message.isStreaming && (
                <span className="streaming-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              )}
            </>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
