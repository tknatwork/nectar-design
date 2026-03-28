import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * GlassCard — Apple Liquid Glass-inspired component with 3 depth levels.
 *
 * The actual component lives in `app/components/ui/GlassCard.tsx` and uses
 * motion.dev for hover lift animation. This story demonstrates the glass
 * pattern using the same CSS conventions.
 *
 * Depths:
 * - **surface** (16px blur, 0.02 opacity) — base containers
 * - **raised** (24px blur, 0.03 opacity) — cards, dialogs
 * - **floating** (32px blur, 0.06 opacity) — modals, tooltips
 */

function GlassDemo({
  depth,
  size,
  children,
}: {
  depth: 'surface' | 'raised' | 'floating';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}) {
  const blur = { surface: 16, raised: 24, floating: 32 }[depth];
  const opacity = { surface: 0.02, raised: 0.03, floating: 0.06 }[depth];
  const padding = { sm: '1.5rem', md: '2rem', lg: '3rem' }[size];

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 28,
        padding,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px) saturate(1.4)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(1.4)`,
        boxShadow: `0 ${blur}px ${blur * 2}px rgba(0,0,0,0.15)`,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'box-shadow 0.8s ease-out',
      }}
    >
      {children}
    </div>
  );
}

const meta: Meta<typeof GlassDemo> = {
  title: 'Patterns/GlassCard',
  component: GlassDemo,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0a0a0a' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof GlassDemo>;

export const Surface: Story = {
  args: { depth: 'surface', size: 'md' },
  render: (args) => (
    <GlassDemo {...args}>
      <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
        Surface Depth
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>
        16px blur, 2% opacity. Used for base containers and sections.
      </p>
    </GlassDemo>
  ),
};

export const Raised: Story = {
  args: { depth: 'raised', size: 'md' },
  render: (args) => (
    <GlassDemo {...args}>
      <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
        Raised Depth
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>
        24px blur, 3% opacity. Used for cards, dialogs, and dropdowns.
      </p>
    </GlassDemo>
  ),
};

export const Floating: Story = {
  args: { depth: 'floating', size: 'md' },
  render: (args) => (
    <GlassDemo {...args}>
      <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
        Floating Depth
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>
        32px blur, 6% opacity. Used for modals, tooltips, and overlays.
      </p>
    </GlassDemo>
  ),
};

export const AllDepths: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 360 }}>
      <GlassDemo depth="surface" size="md">
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>surface — 16px blur</p>
      </GlassDemo>
      <GlassDemo depth="raised" size="md">
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>raised — 24px blur</p>
      </GlassDemo>
      <GlassDemo depth="floating" size="md">
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>floating — 32px blur</p>
      </GlassDemo>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 400 }}>
      <GlassDemo depth="raised" size="sm">
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Small (1.5rem padding)</p>
      </GlassDemo>
      <GlassDemo depth="raised" size="md">
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Medium (2rem padding)</p>
      </GlassDemo>
      <GlassDemo depth="raised" size="lg">
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Large (3rem padding)</p>
      </GlassDemo>
    </div>
  ),
};
