import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Components/Forms/Input',
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'reviewer@company.com' },
};

export const Error: Story = {
  args: { variant: 'error', defaultValue: 'not-an-email', placeholder: 'Email' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'project-slug' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Input variant="default" placeholder="Default" />
      <Input variant="error" defaultValue="Invalid input" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320 }}>
      <span>Project title</span>
      <Input placeholder="Brief description" />
    </label>
  ),
};
