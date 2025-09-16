import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { NewsStatus as NewsStatusType } from '../../types';
import './NewsStatusWidget.scss';

const NewsStatusWidget: React.FC = () => {
  const [newsStatus, setNewsStatus] = useState<NewsStatusType | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsStatus = async () => {
    try {
      setError(null);
      const status = await apiService.getNewsStatus();
      setNewsStatus(status);
    } catch (error: any) {
      console.error('Failed to fetch news status:', error);
      setError(error.error || 'Failed to fetch news status');
    }
  };

  const handleManualUpdate = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      await apiService.triggerNewsUpdate();
      // Refresh status after triggering update
      setTimeout(() => fetchNewsStatus(), 1000);
    } catch (error: any) {
      console.error('Failed to trigger news update:', error);
      setError(error.error || 'Failed to trigger news update');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchNewsStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNewsStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="news-status-widget error">
        <div className="widget-compact">
          <span className="status-icon">⚠️</span>
          <span className="status-text">News Error</span>
          <button onClick={fetchNewsStatus} className="retry-btn" title="Retry">
            🔄
          </button>
        </div>
      </div>
    );
  }

  if (!newsStatus) {
    return (
      <div className="news-status-widget loading">
        <div className="widget-compact">
          <span className="loading-spinner"></span>
          <span className="status-text">Loading...</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (newsStatus.stats.isRunning) return '🔄';
    if (newsStatus.stats.lastErrorAt) return '⚠️';
    return '✅';
  };

  const getCompactStatusText = () => {
    if (newsStatus.stats.isRunning) return 'Updating...';
    
    // Try to get the most recent update time from either lastUpdate or lastSuccessAt
    let updateTime: Date | null = null;
    if (newsStatus.lastUpdate) {
      updateTime = new Date(newsStatus.lastUpdate);
    } else if (newsStatus.stats.lastSuccessAt) {
      updateTime = new Date(newsStatus.stats.lastSuccessAt);
    }
    
    if (updateTime && !isNaN(updateTime.getTime())) {
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just updated';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
    
    // If no valid update time, check if we have any documents
    if (newsStatus.documentCount > 0) {
      return 'Ready';
    }
    
    return 'No updates yet';
  };

  const getLastUpdateFormatted = () => {
    // Try to get the most recent update time from either lastUpdate or lastSuccessAt
    let updateTime: Date | null = null;
    if (newsStatus.lastUpdate) {
      updateTime = new Date(newsStatus.lastUpdate);
    } else if (newsStatus.stats.lastSuccessAt) {
      updateTime = new Date(newsStatus.stats.lastSuccessAt);
    }
    
    if (updateTime && !isNaN(updateTime.getTime())) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(updateTime);
    }
    
    // If no valid update time, check if we have any documents
    if (newsStatus.documentCount > 0) {
      return 'Unknown';
    }
    
    return 'Never';
  };

  return (
    <div className={`news-status-widget ${isExpanded ? 'expanded' : ''}`}>
      <div className="widget-compact" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="status-icon">{getStatusIcon()}</span>
        <div className="status-info">
          <span className="status-text">{getCompactStatusText()}</span>
          <span className="document-count">{newsStatus.documentCount} articles</span>
        </div>
        <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>▼</span>
      </div>

      {isExpanded && (
        <div className="widget-expanded">
          <div className="expanded-content">
            <div className="status-row">
              <span className="label">Last Update:</span>
              <span className="value">{getLastUpdateFormatted()}</span>
            </div>
            
            {newsStatus.cronEnabled && (
              <div className="status-row">
                <span className="label">Next Update:</span>
                <span className="value">{newsStatus.nextUpdateFormatted}</span>
              </div>
            )}

            <div className="status-row">
              <span className="label">Auto Updates:</span>
              <span className="value">
                {newsStatus.cronEnabled ? 
                  `Every ${newsStatus.cronIntervalFormatted}` : 
                  'Disabled'
                }
              </span>
            </div>

            {newsStatus.stats.totalRuns > 0 && (
              <div className="status-row">
                <span className="label">Success Rate:</span>
                <span className="value">
                  {Math.round((newsStatus.stats.successfulRuns / newsStatus.stats.totalRuns) * 100)}%
                </span>
              </div>
            )}
          </div>

          <div className="widget-actions">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleManualUpdate();
              }} 
              disabled={isUpdating || newsStatus.stats.isRunning}
              className="update-btn"
            >
              {isUpdating ? '⏳' : '🔄'} Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsStatusWidget;
