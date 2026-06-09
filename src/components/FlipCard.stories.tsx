import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FlipCard } from './FlipCard';

const meta = {
  title: 'Components/Layout/FlipCard',
  component: FlipCard,
  // Required `rotation` + `children` live at meta level so render-based stories
  // (which supply their own rotation/faces) satisfy the args type; each story
  // overrides via its own render.
  args: { rotation: 0, children: null },
} satisfies Meta<typeof FlipCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// FlipCard owns only the rotating preserve-3d container — the caller supplies
// fully-styled faces. These demo faces share chrome so the flip reads cleanly:
// front sits in flow (defines size), back is inset:0 + pre-rotated + backface-hidden.
const faceBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 200,
  height: 120,
  borderRadius: 12,
  fontWeight: 600,
  backfaceVisibility: 'hidden',
};

function Faces({ axis = 'x' }: { axis?: 'x' | 'y' }) {
  const backRotate = axis === 'x' ? 'rotateX(180deg)' : 'rotateY(180deg)';
  return (
    <>
      <div
        style={{
          ...faceBase,
          background: 'oklch(0.62 0.12 145 / 0.16)',
          border: '1px solid oklch(0.55 0.12 145 / 0.38)',
          color: 'oklch(var(--L-heading) 0.01 var(--dynamic-hue))',
        }}
      >
        Front
      </div>
      <div
        style={{
          ...faceBase,
          position: 'absolute',
          inset: 0,
          transform: backRotate,
          background: 'oklch(0.62 0.12 25 / 0.16)',
          border: '1px solid oklch(0.55 0.12 25 / 0.38)',
          color: 'oklch(var(--L-heading) 0.01 var(--dynamic-hue))',
        }}
      >
        Back
      </div>
    </>
  );
}

// Drag the `rotation` control: 0 shows the front, 180 the back. The caller owns
// this cumulative value, so adding 360 forces a full spin back to the same face.
export const Default: Story = {
  args: { rotation: 0 },
  argTypes: {
    rotation: { control: { type: 'range', min: 0, max: 720, step: 90 } },
  },
  render: (args) => (
    <FlipCard {...args}>
      <Faces axis={args.axis ?? 'x'} />
    </FlipCard>
  ),
};

// Flipped to the back face (rotation mod 360 === 180).
export const Flipped: Story = {
  render: () => (
    <FlipCard rotation={180}>
      <Faces />
    </FlipCard>
  ),
};

// The two flip axes: 'x' (default, top-over-bottom) vs 'y' (left-over-right).
export const Axes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <FlipCard rotation={180} axis="x">
        <Faces axis="x" />
      </FlipCard>
      <FlipCard rotation={180} axis="y">
        <Faces axis="y" />
      </FlipCard>
    </div>
  ),
};

// A slower, longer-duration flip via durationSec.
export const SlowFlip: Story = {
  render: () => (
    <FlipCard rotation={180} durationSec={1.6}>
      <Faces />
    </FlipCard>
  ),
};
