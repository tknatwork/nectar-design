import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavPill } from './NavPill';

const meta = {
  title: 'Components/Navigation/NavPill',
  component: NavPill,
  // Defaults so render-light stories satisfy the required-props type; the
  // default `<a>` LinkComponent is used (no router needed in Storybook).
  args: {
    brand: { label: 'TKN', href: '/' },
    items: [
      { label: 'Work', href: '/projects', active: true },
      { label: 'Lab', href: '/labs' },
      { label: 'About', href: '/about' },
      { label: 'Resume', href: '/resume' },
    ],
  },
} satisfies Meta<typeof NavPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ResumeActive: Story = {
  args: {
    items: [
      { label: 'Work', href: '/projects' },
      { label: 'Lab', href: '/labs' },
      { label: 'About', href: '/about' },
      { label: 'Resume', href: '/resume', active: true },
    ],
  },
};

// EAST sub-brand theming: the `--nav-*` overrides + solid chrome material come
// from the .sub-brand-systems-thinking scope (the same class SiteNavRouter
// applies on the EAST route).
export const EastSubBrand: Story = {
  decorators: [
    (Story) => (
      <div className="sub-brand-systems-thinking">
        <Story />
      </div>
    ),
  ],
};
