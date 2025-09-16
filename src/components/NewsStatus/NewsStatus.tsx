import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { NewsStatus as NewsStatusType } from '../../types';
import './NewsStatus.scss';

const NewsStatus: React.FC = () => {
  const [newsStatus, setNewsStatus] = useState<NewsStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="news-status loading">
        <div className="status-indicator">
          <span className="loading-spinner"></span>
          <span>Loading news status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-status error">
        <div className="status-indicator">
          <span className="status-icon error">⚠️</span>
          <span>Error: {error}</span>
        </div>
        <button onClick={fetchNewsStatus} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!newsStatus) return null;

  const getStatusIcon = () => {
    if (newsStatus.stats.isRunning) return '🔄';
    if (newsStatus.stats.lastErrorAt) return '⚠️';
    return '✅';
  };

  const getStatusText = () => {
    if (newsStatus.stats.isRunning) return 'Updating...';
    if (newsStatus.stats.lastErrorAt) return 'Last update failed';
    return 'Up to date';
  };

  return (
    <div className="news-status">
      <div className="status-header">
        <div className="status-indicator">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>
        <button 
          onClick={handleManualUpdate} 
          disabled={isUpdating || newsStatus.stats.isRunning}
          className="update-button"
        >
          {isUpdating ? '⏳ Updating...' : '🔄 Update Now'}
        </button>
      </div>

      <div className="status-details">
        <div className="status-row">
          <span className="label">Last Update:</span>
          <span className="value" title={newsStatus.lastUpdate || 'Never'}>
            {newsStatus.lastUpdateFormatted}
          </span>
        </div>
        
        {newsStatus.cronEnabled && (
          <div className="status-row">
            <span className="label">Next Update:</span>
            <span className="value" title={newsStatus.nextUpdate || 'Not scheduled'}>
              {newsStatus.nextUpdateFormatted}
            </span>
          </div>
        )}

        <div className="status-row">
          <span className="label">Articles:</span>
          <span className="value">{newsStatus.documentCount} documents</span>
        </div>

        <div className="status-row">
          <span className="label">Auto Updates:</span>
          <span className="value">
            {newsStatus.cronEnabled ? (
              <>Enabled (every {newsStatus.cronIntervalFormatted})</>
            ) : (
              'Disabled'
            )}
          </span>
        </div>

        {newsStatus.stats.totalRuns > 0 && (
          <div className="status-row">
            <span className="label">Success Rate:</span>
            <span className="value">
              {newsStatus.stats.successfulRuns}/{newsStatus.stats.totalRuns} 
              {' '}({Math.round((newsStatus.stats.successfulRuns / newsStatus.stats.totalRuns) * 100)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsStatus;
