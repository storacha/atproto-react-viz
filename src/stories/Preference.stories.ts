import type { Meta, StoryObj } from "@storybook/react";

import { Preference } from "../components/Preference";
import { BskyPreferences } from "@atproto/api";

const examplePreference: BskyPreferences = {
  feeds: {
    saved: [],
    pinned: []
  },
  savedFeeds: [],
  feedViewPrefs: {},
  threadViewPrefs: {
    sort: "oldest",
    prioritizeFollowedUsers: false
  },
  moderationPrefs: {
    adultContentEnabled: false,
    labels: {},
    labelers: [],
    mutedWords: [],
    hiddenPosts: []
  },
  birthDate: new Date(),
  interests: {
    tags: []
  },
  bskyAppState: {
    queuedNudges: [],
    activeProgressGuide: undefined,
    nuxs: []
  },
  postInteractionSettings: {
    threadgateAllowRules: [],
    postgateEmbeddingRules: []
  }
};

const meta = {
  title: "Example/Preference",
  component: Preference,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Preference>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    preference: examplePreference,
  },
};
