import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { className: 'h-4 w-48' },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Skeleton variant="default" className="h-12 w-12" />
      <Skeleton variant="circular" className="h-12 w-12" />
      <Skeleton variant="text" />
    </div>
  ),
};

export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: 320 }}>
      <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  ),
};
