import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from './Heading';

const meta = {
  title: 'Components/Typography/Heading',
  component: Heading,
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Design engineering, end to end' },
};

// The full typographic scale, level 1 (largest) through 6.
export const Levels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
      <Heading level={4}>Heading level 4</Heading>
      <Heading level={5}>Heading level 5</Heading>
      <Heading level={6}>Heading level 6</Heading>
    </div>
  ),
};

// `as` decouples the rendered tag from the visual level — an h2 element
// styled at the level-1 scale, for correct document outline.
export const PolymorphicAs: Story = {
  args: { level: 1, as: 'h2', children: 'Visually level 1, semantically h2' },
};

// `className` extends the base pattern — here overriding the text color.
export const ExtendedClassName: Story = {
  args: { level: 3, children: 'Custom Color', className: 'text-fg-muted' },
};
