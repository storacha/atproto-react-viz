import type { Meta, StoryObj } from '@storybook/react';
import { BlobsVisualizer } from "../components/BlobsVisualizer";
import { BlobItem } from '../hooks/get-blobs';

const meta: Meta<typeof BlobsVisualizer> = {
  title: 'Components/BlobsVisualizer',
  component: BlobsVisualizer,
  parameters: {
    layout: 'centered',
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBlobs: BlobItem[] = [
  {
    cid: 'bafkreidivzimqfqtoqxkrpge6bjyhlvxqs3rhe73owtmdulaxr5do5in7u',
    mimeType: 'image/jpeg',
    size: 234567,
    createdAt: '2023-06-15T14:22:31.000Z',
    imageUrl: 'https://picsum.photos/600/400',
    isImage: true
  },
  {
    cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    mimeType: 'image/png',
    size: 123456,
    createdAt: '2023-06-14T10:15:22.000Z',
    imageUrl: 'https://picsum.photos/800/600',
    isImage: true
  },
  {
    cid: 'bafkreih2o5gstik4taltmdvg4w7tezlap5wpxemw6tryqgjm4gopt7qrxm',
    mimeType: 'image/gif',
    size: 567890,
    createdAt: '2023-06-12T16:33:42.000Z',
    imageUrl: 'https://picsum.photos/500/500',
    isImage: true
  }
];

export const Default: Story = {
  args: {
    blobs: sampleBlobs,
    loading: false
  },
};

export const Loading: Story = {
  args: {
    blobs: [],
    loading: true
  },
};

export const EmptyState: Story = {
  args: {
    blobs: [],
    loading: false
  },
};

export const MixedContent: Story = {
  args: {
    blobs: [
      ...sampleBlobs,
      {
        cid: 'bafkreifwqhhb2omgy5e2lpq7q3kx65hsvbvb5qt3vqu4y4h2gzvhj4q6uy',
        mimeType: 'image/webp',
        size: 321654,
        createdAt: '2023-06-11T09:12:54.000Z',
        imageUrl: 'https://picsum.photos/450/450',
        isImage: true
      },
      {
        cid: 'bafkreifz3nczut4j63rs62ycxgpt3iljgpqbyyxhhtpla2dhdikxbdw6zi',
        mimeType: 'image/svg+xml',
        size: 24680,
        createdAt: '2023-06-10T21:18:37.000Z',
        imageUrl: 'https://picsum.photos/600/300',
        isImage: true
      }
    ],
    loading: false
  },
};
