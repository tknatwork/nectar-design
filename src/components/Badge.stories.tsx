import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const intents = [
  'default',
  'primary',
  'accent',
  'success',
  'warning',
  'destructive',
] as const;
const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'Badge',
    intent: 'default',
    size: 'md',
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllIntents: Story = {
  render: args => (
    <div className="flex flex-wrap gap-3">
      {intents.map(intent => (
        <Badge key={intent} {...args} intent={intent}>
          {intent}
        </Badge>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: args => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map(size => (
        <Badge key={size} {...args} size={size}>
          {size.toUpperCase()}
        </Badge>
      ))}
    </div>
  ),
};
