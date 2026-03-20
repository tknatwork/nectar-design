import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const intents = ['primary', 'accent', 'outline', 'ghost', 'destructive'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
    intent: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllIntents: Story = {
  render: args => (
    <div className="flex flex-wrap gap-3">
      {intents.map(intent => (
        <Button key={intent} {...args} intent={intent}>
          {intent}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: args => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map(size => (
        <Button key={size} {...args} size={size}>
          {size.toUpperCase()}
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled button',
  },
};

export const WithClassName: Story = {
  args: {
    className: 'uppercase tracking-wide shadow-sm',
    children: 'Custom classes',
  },
};
