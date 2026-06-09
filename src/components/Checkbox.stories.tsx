import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Accept terms' },
};

export const Checked: Story = {
  args: { 'aria-label': 'Subscribe to newsletter', defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { 'aria-label': 'Select all', indeterminate: true, defaultChecked: true },
};

export const Disabled: Story = {
  args: { 'aria-label': 'Unavailable option', disabled: true },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Checkbox aria-label="Small" size="sm" defaultChecked />
      <Checkbox aria-label="Medium" size="md" defaultChecked />
      <Checkbox aria-label="Large" size="lg" defaultChecked />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Checkbox id="terms" />
      <span>I agree to the terms and conditions</span>
    </label>
  ),
};
