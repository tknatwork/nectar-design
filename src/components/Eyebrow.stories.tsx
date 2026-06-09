import type { Meta, StoryObj } from '@storybook/react-vite';

import { Eyebrow } from './Eyebrow';

const meta = {
  title: 'Components/Typography/Eyebrow',
  component: Eyebrow,
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Selected Work' },
};

// The eyebrow sits above a title — shown here in context.
export const AboveTitle: Story = {
  render: () => (
    <div>
      <Eyebrow>Practice</Eyebrow>
      <h2 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 600 }}>
        Design engineering, end to end
      </h2>
    </div>
  ),
};

// Common section labels across the portfolio.
export const Labels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Eyebrow>Selected Work</Eyebrow>
      <Eyebrow>Practice</Eyebrow>
      <Eyebrow>About</Eyebrow>
      <Eyebrow>Get in Touch</Eyebrow>
    </div>
  ),
};

// `className` extends the base pattern — here nudging the tracking wider.
export const ExtendedClassName: Story = {
  args: { children: 'Custom Spacing', className: 'tracking-[0.24em]' },
};
