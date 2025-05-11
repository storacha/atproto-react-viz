import { BskyAgent } from '@atproto/api';
import { AppBskyActorGetPreferences } from '@atproto/api';

export type Preferences = AppBskyActorGetPreferences.OutputSchema;

export const usePreferences = (agent: BskyAgent) => {
  const fetchPreferences = async (): Promise<Preferences> => {
    try {
      const response = await agent.app.bsky.actor.getPreferences();
      return response.data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  };

  return { fetchPreferences };
}; 