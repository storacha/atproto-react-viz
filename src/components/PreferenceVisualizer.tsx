import React, { useEffect, useState } from 'react';
import { BskyAgent } from '@atproto/api';
import { usePreferences, Preferences } from '../hooks/get-preferences';
import '../styles/preferences.css';

interface PreferenceVisualizerProps {
  agent: BskyAgent;
}

export const PreferenceVisualizer: React.FC<PreferenceVisualizerProps> = ({ agent }) => {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { fetchPreferences } = usePreferences(agent);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await fetchPreferences();
        setPreferences(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      }
    };

    loadPreferences();
  }, [agent]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!preferences) {
    return <div className="loading">Loading preferences...</div>;
  }

  return (
    <div className="preferences-container">
      <div className="preferences-header">
        <h2>Account Preferences</h2>
      </div>
      <div className="preferences-content">
        <pre className="preferences-json">
          {JSON.stringify(preferences, null, 2)}
        </pre>
      </div>
    </div>
  );
}; 