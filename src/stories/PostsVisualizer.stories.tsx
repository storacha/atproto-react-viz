import type { Meta, StoryObj } from '@storybook/react';
import { PostVisualizer } from "./PostsVisualizer";
import { RepoEntry } from "@atcute/car";

import { BlueSkySessionData } from '../utils/types';

const meta: Meta<typeof PostVisualizer> = {
  title: 'Components/PostVisualizer',
  component: PostVisualizer,
  parameters: {
    layout: 'centered',
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

const samplePosts: RepoEntry[] = [
  {
    rkey: '1',
    record: {
      text: 'This is my first post on the platform! Excited to join the community.',
      createdAt: '2025-04-03T14:53:12.000Z',
    },
    uri: 'at://user.bsky.social/posts/1',
    cid: 'bafyreia...',
  },
  {
    rkey: '2',
    record: {
      text: 'Just published my new article about React performance optimization techniques.',
      createdAt: '2025-04-02T09:32:01.000Z',
    },
    uri: 'at://user.bsky.social/posts/2',
    cid: 'bafyreib...',
  },
  {
    rkey: '3',
    record: {
      text: 'Does anyone have recommendations for good TypeScript courses?',
      createdAt: '2025-04-01T18:21:45.000Z',
    },
    uri: 'at://user.bsky.social/posts/3',
    cid: 'bafyreic...',
  },
];

const sampleSession: Partial<BlueSkySessionData> = {
  handle: 'johndoe.bsky.social',
  did: 'did:plc:abcdef123456',
  email: 'john@example.com',
  accessJwt: 'eyJhbGc...',
  refreshJwt: 'eyJhbGc...',
};

export const Default: Story = {
  args: {
    posts: samplePosts,
    session: sampleSession,
  },
};

export const EmptyState: Story = {
  args: {
    posts: [],
    session: sampleSession,
  },
};

export const DifferentUser: Story = {
  args: {
    posts: samplePosts,
    session: {
      ...sampleSession,
      handle: 'janesmith.bsky.social',
    },
  },
};

export const WithError: Story = {
  args: {
    posts: [
      {
        rkey: 'error',
        record: {},
        uri: 'at://user.bsky.social/posts/error',
        cid: 'bafyreid...',
      },
      ...samplePosts,
    ],
    session: sampleSession,
  },
};
