import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from './Breadcrumbs';

const meta = {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' },
      { label: 'Profile' },
    ],
  },
};

// Two-item trail — minimal navigation depth.
export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Account' },
    ],
  },
};

// Deep trail with several intermediate links.
export const DeepTrail: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Nectar', href: '/projects/nectar' },
      { label: 'Components', href: '/projects/nectar/components' },
      { label: 'Breadcrumbs' },
    ],
  },
};

// Custom separator overriding the default chevron.
export const CustomSeparator: Story = {
  args: {
    separator: <span>/</span>,
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Foundations', href: '/docs/foundations' },
      { label: 'Color' },
    ],
  },
};

// Single item renders as the current page only (no separator, no link).
export const CurrentPageOnly: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};
