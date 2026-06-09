import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProjectLayout } from './ProjectLayout';

const meta = {
  title: 'Components/Layout/ProjectLayout',
  component: ProjectLayout,
} satisfies Meta<typeof ProjectLayout>;
export default meta;

type Story = StoryObj<typeof meta>;

// Descendants consume the injected CSS custom properties — the same pattern
// case-study pages use (e.g. bg-[var(--accent)]).
function ThemedCard() {
  return (
    <div
      style={{
        background: 'var(--bg, transparent)',
        borderTop: '4px solid var(--accent, #888)',
        borderRadius: 12,
        padding: 24,
      }}
    >
      <h3 style={{ margin: '0 0 8px', color: 'var(--primary, inherit)' }}>
        Systems Thinking Experiments
      </h3>
      <p style={{ margin: 0 }}>
        Per-project accent and primary flow down via CSS custom properties — no
        JS recomputation. Derived tokens recompute through the cascade.
      </p>
    </div>
  );
}

export const Default: Story = {
  args: {
    project: {
      slug: 'systems-thinking-experiments',
      primaryColor: '#e4342c',
      accentColor: '#e4342c',
      bgColor: '#fdf2f1',
    },
    children: <ThemedCard />,
  },
};

// Only --primary is overridden; --accent / --bg fall back to defaults.
export const PrimaryOnly: Story = {
  args: {
    project: { slug: 'east', primaryColor: '#5A4226' },
    children: <ThemedCard />,
  },
};

// Only --accent is overridden.
export const AccentOnly: Story = {
  args: {
    project: { slug: 'east', accentColor: '#5A4226' },
    children: <ThemedCard />,
  },
};

// No color props → pure passthrough wrapper, descendants use global tokens.
export const NoOverrides: Story = {
  args: {
    project: { slug: 'plain-project' },
    children: <ThemedCard />,
  },
};
