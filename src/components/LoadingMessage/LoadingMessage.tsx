import React from 'react';
import './LoadingMessage.scss';

const LoadingMessage: React.FC = () => {
  return (
    <div className="loading-message">
      <div className="message-avatar">
        <div className="assistant-avatar">🤖</div>
      </div>
      
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">AI Assistant</span>
          <span className="message-time">Now</span>
        </div>
        
        <div className="loading-dots">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="loading-text">Thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
