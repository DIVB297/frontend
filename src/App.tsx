import React, { useState, useEffect, useRef } from 'react';
import { useChatStream } from './hooks/useChatStream';
import ChatMessage from './components/ChatMessage/ChatMessage';
import ChatInput from './components/ChatInput/ChatInput';
import LoadingMessage from './components/LoadingMessage/LoadingMessage';
import SourcesPanel from './components/SourcesPanel/SourcesPanel';
import NewsStatus from './components/NewsStatus/NewsStatus';
import NewsStatusWidget from './components/NewsStatusWidget/NewsStatusWidget';
import './App.scss';

function App() {
  const {
    messages,
    loading,
    error,
    sessionId,
    sources,
    sendMessage,
    clearChat,
    resetSession,
  } = useChatStream();

  const [showSources, setShowSources] = useState(false);
  const [hasNewSources, setHasNewSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Track new sources
  useEffect(() => {
    if (sources.length > 0 && !showSources) {
      setHasNewSources(true);
    }
  }, [sources, showSources]);

  const handleToggleSources = () => {
    setShowSources(!showSources);
    if (!showSources) {
      setHasNewSources(false); // Clear new sources indicator when opening
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      try {
        await clearChat();
        setShowSources(false);
      } catch (error) {
        console.error('Failed to clear chat:', error);
      }
    }
  };

  const handleResetSession = async () => {
    if (window.confirm('Are you sure you want to start a new session? This will clear all chat history.')) {
      try {
        await resetSession();
        setShowSources(false);
      } catch (error) {
        console.error('Failed to reset session:', error);
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              🤖 RAG News Chatbot
            </h1>
            <p className="app-subtitle">
              Ask questions about recent news and get AI-powered answers with sources
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="action-button secondary" 
              onClick={handleClearChat}
              disabled={loading || messages.length === 0}
              title="Clear chat history"
            >
              🗑️ Clear Chat
            </button>
            <button 
              className="action-button primary" 
              onClick={handleResetSession}
              disabled={loading}
              title="Start new session"
            >
              🔄 New Session
            </button>
          </div>
        </div>
        
        {sessionId && (
          <div className="session-info">
            <span className="session-id">Session: {sessionId.substring(0, 8)}...</span>
            <span className="session-status connected">● Connected</span>
          </div>
        )}
      </header>

      <main className="app-main">
        <div className="chat-container">
          <div className="messages-area">
            {messages.length === 0 && !loading && (
              <div className="welcome-message">
                <div className="welcome-content">
                  <h2>👋 Welcome to RAG News Chatbot!</h2>
                  <p>I can help you find information from recent news articles. Here are some examples:</p>
                  <div className="example-queries">
                    <button 
                      className="example-query"
                      onClick={() => handleSendMessage("What's happening in technology today?")}
                      disabled={loading}
                    >
                      "What's happening in technology today?"
                    </button>
                    <button 
                      className="example-query"
                      onClick={() => handleSendMessage("Tell me about recent economic developments")}
                      disabled={loading}
                    >
                      "Tell me about recent economic developments"
                    </button>
                    <button 
                      className="example-query"
                      onClick={() => handleSendMessage("What are the latest sports news?")}
                      disabled={loading}
                    >
                      "What are the latest sports news?"
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}

            {loading && <LoadingMessage />}

            {error && (
              <div className="error-message">
                <div className="error-content">
                  <span className="error-icon">⚠️</span>
                  <div className="error-text">
                    <strong>Something went wrong:</strong>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <SourcesPanel
            sources={sources}
            isVisible={showSources}
            onToggle={handleToggleSources}
            hasNewSources={hasNewSources}
          />

          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={loading}
            placeholder={loading ? "Thinking..." : "Ask me anything about recent news..."}
          />
        </div>
      </main>

      {/* Floating News Status Widget */}
      <NewsStatusWidget />
    </div>
  );
}

export default App;
