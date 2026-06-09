import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta = {
  title: 'Components/Layout/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { orientation: 'horizontal', spacing: 'md' },
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <p>Section above the divider.</p>
      <Divider orientation="horizontal" spacing="md" />
      <p>Section below the divider.</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', height: 48 }}>
      <span>Left</span>
      <Divider orientation="vertical" spacing="md" />
      <span>Right</span>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((spacing) => (
        <div key={spacing}>
          <span>spacing="{spacing}"</span>
          <Divider orientation="horizontal" spacing={spacing} />
        </div>
      ))}
    </div>
  ),
};
