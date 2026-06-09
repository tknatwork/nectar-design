import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const options = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product' },
  { value: 'research', label: 'Research', disabled: true },
];

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  // Required `options` at meta level so render-based stories satisfy the args type.
  args: { options },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { options, placeholder: 'Pick a team' },
};

export const Error: Story = {
  args: { options, variant: 'error', placeholder: 'Required field' },
};

export const Disabled: Story = {
  args: { options, disabled: true, defaultValue: 'design' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Select size="sm" options={options} placeholder="Small" />
      <Select size="md" options={options} placeholder="Medium" />
      <Select size="lg" options={options} placeholder="Large" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Select variant="default" options={options} placeholder="Default" />
      <Select variant="error" options={options} placeholder="Error" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320 }}>
      <span>Assign team</span>
      <Select options={options} placeholder="Pick a team" />
    </label>
  ),
};
