import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const paddings = ['none', 'sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    padding: 'md',
    children: (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-fg">Card title</h3>
        <p className="text-sm text-muted-fg">
          Use cards to group related content with consistent surface styling.
        </p>
      </div>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
  },
};

export const PaddingVariants: Story = {
  render: args => (
    <div className="flex flex-wrap gap-4">
      {paddings.map(padding => (
        <Card key={padding} {...args} padding={padding} className="w-72">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-fg">{padding} padding</h3>
            <p className="text-sm text-muted-fg">
              This example shows the <code>{padding}</code> spacing option.
            </p>
          </div>
        </Card>
      ))}
    </div>
  ),
};
