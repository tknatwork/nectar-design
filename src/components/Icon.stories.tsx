import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';

const meta = {
  title: 'Components/Data Display/Icon',
  component: Icon,
  args: { icon: 'ph:house-duotone' },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { icon: 'ph:house-duotone', size: 'md' },
};

// size variant axis: sm | md | lg | xl
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Icon icon="ph:house-duotone" size="sm" />
      <Icon icon="ph:house-duotone" size="md" />
      <Icon icon="ph:house-duotone" size="lg" />
      <Icon icon="ph:house-duotone" size="xl" />
    </div>
  ),
};

// Inherits text color via currentColor — drive it with text-* utilities.
export const Colored: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Icon icon="lucide:settings" size="lg" className="text-primary" />
      <Icon icon="lucide:settings" size="lg" className="text-muted-fg" />
      <Icon icon="lucide:settings" size="lg" className="text-fg" />
    </div>
  ),
};

// Any Iconify set works (ph, lucide, …).
export const IconSets: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Icon icon="ph:magnifying-glass" size="lg" />
      <Icon icon="lucide:search" size="lg" />
      <Icon icon="ph:gear-duotone" size="lg" />
      <Icon icon="lucide:bell" size="lg" />
    </div>
  ),
};

// Semantic icon: aria-label makes it accessible (role="img", not aria-hidden).
export const Semantic: Story = {
  args: { icon: 'ph:magnifying-glass', size: 'lg', 'aria-label': 'Search' },
};
