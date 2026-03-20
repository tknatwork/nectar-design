import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    size: 'md',
    variant: 'default',
    placeholder: 'Enter text',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: args => (
    <div className="flex w-full max-w-md flex-col gap-3">
      {sizes.map(size => (
        <Input key={size} {...args} size={size} placeholder={`${size.toUpperCase()} input`} />
      ))}
    </div>
  ),
};

export const Error: Story = {
  args: {
    variant: 'error',
    defaultValue: 'Invalid value',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'name@example.com',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Disabled input',
  },
};
