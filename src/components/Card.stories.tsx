import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Components/Layout/Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Card content goes here.',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card variant="default">Default — flat surface with a border.</Card>
      <Card variant="interactive">Interactive — hover to highlight the border.</Card>
      <Card variant="elevated">Elevated — raised with a shadow.</Card>
    </div>
  ),
};

export const Padding: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card padding="none">No padding</Card>
      <Card padding="sm">Small padding</Card>
      <Card padding="md">Medium padding (default)</Card>
      <Card padding="lg">Large padding</Card>
    </div>
  ),
};

export const Composed: Story = {
  render: () => (
    <Card variant="elevated" padding="lg" className="max-w-sm space-y-2">
      <h2 className="font-display text-xl text-fg">Project title</h2>
      <p className="text-muted-fg">
        A short supporting description that explains what this card represents.
      </p>
    </Card>
  ),
};
