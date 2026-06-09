import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  title: 'Components/Forms/Textarea',
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Share your thoughts…', rows: 4 },
};

export const Error: Story = {
  args: { variant: 'error', rows: 4, defaultValue: 'This field needs more detail.' },
};

export const Disabled: Story = {
  args: { disabled: true, rows: 4, defaultValue: 'Comments are closed for this review.' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Textarea size="sm" rows={2} placeholder="Small" />
      <Textarea size="md" rows={3} placeholder="Medium" />
      <Textarea size="lg" rows={4} placeholder="Large" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Textarea variant="default" rows={3} placeholder="Default" />
      <Textarea variant="error" rows={3} defaultValue="Invalid input" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320 }}>
      <span>Add a comment</span>
      <Textarea placeholder="Write a message…" rows={4} />
    </label>
  ),
};
