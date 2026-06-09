import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  args: { children: 'Button' },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Save' },
};

// One per intent axis value
export const Intents: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button intent="primary">Primary</Button>
      <Button intent="accent">Accent</Button>
      <Button intent="outline">Outline</Button>
      <Button intent="ghost">Ghost</Button>
      <Button intent="destructive">Delete</Button>
    </div>
  ),
};

// One per size axis value
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { children: 'Submit', disabled: true },
};
