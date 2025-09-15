import React from 'react';
import { SearchResult } from '../../types';
import './SourcesPanel.scss';

interface SourcesPanelProps {
  sources: SearchResult[];
  isVisible: boolean;
  onToggle: () => void;
  hasNewSources?: boolean;
}

const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources, isVisible, onToggle, hasNewSources = false }) => {
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return '#28a745'; // Green
    if (score >= 0.6) return '#ffc107'; // Yellow
    return '#6c757d'; // Gray
  };

  if (sources.length === 0) return null;

  return (
    <div className={`sources-panel ${isVisible ? 'visible' : ''}`}>
      <div className="sources-header">
        <button className="toggle-button" onClick={onToggle}>
          <span className="sources-title">
            📚 Sources ({sources.length})
            {hasNewSources && !isVisible && (
              <span className="new-sources-dot"></span>
            )}
          </span>
          <svg
            className={`chevron ${isVisible ? 'rotated' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {isVisible && (
        <div className="sources-content">
          <div className="sources-list">
            {sources.map((source, index) => (
              <div key={`${source.articleId}-${index}`} className="source-item">
                <div className="source-header">
                  <div className="source-info">
                    <h4 className="source-title">
                      {source.metadata?.title || `Article ${index + 1}`}
                    </h4>
                    <div className="source-meta">
                      {source.metadata?.source && (
                        <span className="source-name">{source.metadata.source}</span>
                      )}
                      {source.metadata?.publishedAt && (
                        <span className="source-date">
                          {formatDate(source.metadata.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="source-score">
                    <div 
                      className="score-indicator"
                      style={{ backgroundColor: getScoreColor(source.score) }}
                    >
                      {Math.round(source.score * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="source-content">
                  <p>{truncateContent(source.content)}</p>
                </div>
                
                {source.metadata?.url && (
                  <div className="source-actions">
                    <a
                      href={source.metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="read-more-link"
                    >
                      Read full article ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="sources-footer">
            <p className="sources-disclaimer">
              Sources are ranked by relevance to your query. Click to read the full articles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourcesPanel;
