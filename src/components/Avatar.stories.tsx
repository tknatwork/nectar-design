import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta = {
  title: 'Components/Data Display/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { alt: 'Jane Doe' },
};

// One per size axis value
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar size="sm" alt="Sam Sm" />
      <Avatar size="md" alt="Mia Md" />
      <Avatar size="lg" alt="Leo Lg" />
      <Avatar size="xl" alt="Xena Xl" />
    </div>
  ),
};

// Explicit fallback string instead of initials derived from alt
export const Fallback: Story = {
  args: { alt: 'Acme Corp', fallback: 'AC', size: 'lg' },
};

// Image source; falls back to initials automatically on load error
export const WithImage: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar
        size="lg"
        src="https://i.pravatar.cc/96?img=12"
        alt="Jordan Lee"
      />
      <Avatar size="lg" src="/does-not-exist.jpg" alt="Broken Image" />
    </div>
  ),
};
