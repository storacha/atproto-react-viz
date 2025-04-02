import type { Meta, StoryObj } from '@storybook/react';

import { Preference } from '../components/Preference';

const meta = {
  title: 'Example/Preference',
  component: Preference,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  args: {
    backgroundColor: 'red',
  },
} satisfies Meta<typeof Preference>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {}
};
