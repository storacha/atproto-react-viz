import type { Meta, StoryObj } from '@storybook/react';
import { PreferenceVisualizer } from '../components/PreferenceVisualizer';
import { BskyAgent } from '@atproto/api';
import { Preferences } from '../hooks/get-preferences';

const meta: Meta<typeof PreferenceVisualizer> = {
  title: 'Components/PreferenceVisualizer',
  component: PreferenceVisualizer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PreferenceVisualizer>;

// Create a mock agent for the story
const mockAgent = {
  app: {
    bsky: {
      actor: {
        getPreferences: async () => ({
          data: {
            preferences: [
              {
                $type: 'app.bsky.actor.defs#adultContentPref',
                enabled: true,
              },
              {
                $type: 'app.bsky.actor.defs#feedViewPref',
                feed: 'home',
                hideReplies: false,
                hideRepliesByUnfollowed: true,
                hideRepliesByLikeCount: 0,
                hideReposts: false,
                hideQuotePosts: false,
              },
              {
                $type: 'app.bsky.actor.defs#threadViewPref',
                sort: 'latest',
                prioritizeFollowedUsers: true,
              },
              {
                $type: 'app.bsky.actor.defs#savedFeedsPrefV2',
                items: [
                  {
                    id: 'feed-1',
                    type: 'feed',
                    value: 'home',
                    pinned: true,
                  },
                ],
              },
            ],
          },
          headers: {},
          success: true,
        }),
      },
    },
  },
} as unknown as BskyAgent;

export const Default: Story = {
  args: {
    agent: mockAgent,
  },
};

// Story with error state
const errorAgent = {
  app: {
    bsky: {
      actor: {
        getPreferences: async () => {
          throw new Error('Failed to fetch preferences');
        },
      },
    },
  },
} as unknown as BskyAgent;

export const WithError: Story = {
  args: {
    agent: errorAgent,
  },
}; 