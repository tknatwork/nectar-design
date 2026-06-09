import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from './Grid';

const meta = {
  title: 'Components/Layout/Grid',
  component: Grid,
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Surface so each grid cell is visible against the canvas.
const cell: React.CSSProperties = {
  background: 'var(--color-surface-2, rgba(127,127,127,0.12))',
  padding: '1rem',
  borderRadius: 8,
  textAlign: 'center',
};

const cells = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} style={cell}>
      Cell {i + 1}
    </div>
  ));

export const Default: Story = {
  args: {
    cols: 3,
    gap: 'md',
    children: cells(6),
  },
};

// One per cols axis value
export const Columns: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {([1, 2, 3, 4, 6, 12] as const).map((cols) => (
        <div key={cols}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
            cols={cols}
          </div>
          <Grid cols={cols} gap="sm">
            {cells(cols)}
          </Grid>
        </div>
      ))}
    </div>
  ),
};

// One per responsive preset — resize the viewport to see breakpoints shift.
export const Responsive: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['tablet', 'desktop', 'wide'] as const).map((responsive) => (
        <div key={responsive}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
            responsive=&quot;{responsive}&quot;
          </div>
          <Grid responsive={responsive} gap="sm">
            {cells(4)}
          </Grid>
        </div>
      ))}
    </div>
  ),
};

// One per gap axis value
export const Gap: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
        <div key={gap}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
            gap=&quot;{gap}&quot;
          </div>
          <Grid cols={3} gap={gap}>
            {cells(3)}
          </Grid>
        </div>
      ))}
    </div>
  ),
};

// One per align axis value — cells have differing heights to show alignment.
export const Align: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['start', 'center', 'end', 'stretch'] as const).map((align) => (
        <div key={align}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
            align=&quot;{align}&quot;
          </div>
          <Grid cols={3} gap="sm" align={align} style={{ minHeight: 120 }}>
            <div style={cell}>Short</div>
            <div style={{ ...cell, paddingBlock: '2.5rem' }}>Taller cell</div>
            <div style={cell}>Short</div>
          </Grid>
        </div>
      ))}
    </div>
  ),
};

export const RightToLeft: Story = {
  args: {
    cols: 3,
    gap: 'sm',
    dir: 'rtl',
    children: cells(6),
  },
};
