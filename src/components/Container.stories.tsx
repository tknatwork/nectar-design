import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './Container';

const meta = {
  title: 'Components/Layout/Container',
  component: Container,
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

// Surface so the centered max-width bounds are visible against the canvas.
const surface: React.CSSProperties = {
  background: 'var(--color-surface-2, rgba(127,127,127,0.12))',
  padding: '1rem',
  borderRadius: 8,
};

export const Default: Story = {
  args: {
    size: 'lg',
    padding: 'responsive',
    children: <div style={surface}>Page content inside a centered container.</div>,
  },
};

// One per size axis value
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
        <Container key={size} size={size}>
          <div style={surface}>size=&quot;{size}&quot;</div>
        </Container>
      ))}
    </div>
  ),
};

// One per padding axis value
export const Padding: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {(['none', 'responsive', 'fixed'] as const).map((padding) => (
        <Container key={padding} size="md" padding={padding}>
          <div style={surface}>padding=&quot;{padding}&quot;</div>
        </Container>
      ))}
    </div>
  ),
};

export const RightToLeft: Story = {
  args: {
    size: 'md',
    dir: 'rtl',
    children: <div style={surface}>محتوى الصفحة داخل حاوية موجهة من اليمين إلى اليسار.</div>,
  },
};
