import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './Link';

const meta = {
  title: 'Components/Actions/Link',
  component: Link,
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: '/about',
    children: 'About this project',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Link href="/about" variant="default">
        Default — primary colour with an underline.
      </Link>
      <Link href="/about" variant="muted">
        Muted — subdued until hovered.
      </Link>
      <Link href="/about" variant="nav">
        Nav — no underline, for navigation bars.
      </Link>
    </div>
  ),
};

export const External: Story = {
  args: {
    href: 'https://design.tusharkantnaik.com',
    external: true,
    children: 'Open the design system',
  },
};
