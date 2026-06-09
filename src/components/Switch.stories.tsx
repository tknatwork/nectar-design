import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Forms/Switch',
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Dark mode' },
};

export const Checked: Story = {
  args: { 'aria-label': 'Email notifications', defaultChecked: true },
};

export const Disabled: Story = {
  args: { 'aria-label': 'Unavailable setting', disabled: true },
};

export const DisabledChecked: Story = {
  args: { 'aria-label': 'Locked setting', disabled: true, defaultChecked: true },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Switch aria-label="Small" size="sm" defaultChecked />
      <Switch aria-label="Medium" size="md" defaultChecked />
      <Switch aria-label="Large" size="lg" defaultChecked />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Switch id="airplane-mode" />
      <span>Airplane mode</span>
    </label>
  ),
};
