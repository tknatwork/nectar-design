import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './Stack';

const meta = {
  title: 'Components/Layout/Stack',
  component: Stack,
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

// Boxes so the gap/alignment/wrap behaviour is visible against the canvas.
const box: React.CSSProperties = {
  background: 'var(--color-surface-2, rgba(127,127,127,0.12))',
  padding: '0.5rem 0.75rem',
  borderRadius: 6,
};

const items = ['One', 'Two', 'Three'].map((label) => (
  <div key={label} style={box}>
    {label}
  </div>
));

export const Default: Story = {
  args: {
    direction: 'vertical',
    gap: 'md',
    children: items,
  },
};

// One per direction axis value
export const Directions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['vertical', 'horizontal'] as const).map((direction) => (
        <Stack key={direction} direction={direction} gap="sm">
          {items}
        </Stack>
      ))}
    </div>
  ),
};

// One per gap axis value (horizontal so the spacing reads clearly)
export const Gaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
        <Stack key={gap} direction="horizontal" gap={gap}>
          <div style={box}>gap=&quot;{gap}&quot;</div>
          <div style={box}>B</div>
          <div style={box}>C</div>
        </Stack>
      ))}
    </div>
  ),
};

// One per align axis value (cross-axis alignment on a horizontal stack)
export const Align: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['start', 'center', 'end', 'stretch'] as const).map((align) => (
        <Stack key={align} direction="horizontal" gap="sm" align={align} style={{ minHeight: 64 }}>
          <div style={box}>align=&quot;{align}&quot;</div>
          <div style={{ ...box, padding: '1.25rem 0.75rem' }}>Tall</div>
        </Stack>
      ))}
    </div>
  ),
};

// One per justify axis value (main-axis distribution on a full-width row)
export const Justify: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['start', 'center', 'end', 'between'] as const).map((justify) => (
        <Stack key={justify} direction="horizontal" gap="sm" justify={justify} style={{ width: 360 }}>
          <div style={box}>justify=&quot;{justify}&quot;</div>
          <div style={box}>B</div>
        </Stack>
      ))}
    </div>
  ),
};

export const Wrap: Story = {
  args: {
    direction: 'horizontal',
    gap: 'sm',
    wrap: true,
    style: { width: 220 },
    children: ['A', 'B', 'C', 'D', 'E', 'F'].map((label) => (
      <div key={label} style={box}>
        {label}
      </div>
    )),
  },
};
