import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label';

const meta = {
  title: 'Components/Forms/Label',
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { htmlFor: 'email', children: 'Email address' },
};

export const Required: Story = {
  args: { htmlFor: 'email', required: true, children: 'Email address' },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Label variant="default">Default label</Label>
      <Label variant="error">Error label</Label>
      <Label variant="disabled">Disabled label</Label>
    </div>
  ),
};
