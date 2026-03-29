import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';

/**
 * Constellation — 4-tier Canvas 2D particle system (9,180 nodes).
 *
 * The actual implementation lives in `app/lib/constellation/` and renders
 * via `app/components/DotGrid.tsx`. This story documents the system
 * architecture and renders a simplified demo.
 *
 * Architecture:
 * - **Tier 1 (Hero):** 12 large nodes, full glow, strong connections
 * - **Tier 2 (Detail):** 168 medium nodes, moderate glow
 * - **Tier 3 (Ambient):** 1,000 small nodes, minimal glow
 * - **Tier 4 (Dust):** 8,000 micro particles, no connections
 *
 * Physics: Adjacency-based, pointer repulsion, idle settle, 60fps GSAP ticker.
 * The system respects prefers-reduced-motion (frozen when active).
 */

function ConstellationDemo({
  nodeCount,
  showConnections,
}: {
  nodeCount: number;
  showConnections: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 600;
    const h = 400;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Generate random nodes
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      if (showConnections) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < Math.min(nodes.length, 200); i++) {
          for (let j = i + 1; j < Math.min(nodes.length, 200); j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              ctx.globalAlpha = 1 - dist / 80;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Draw nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + node.r * 0.15})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [nodeCount, showConnections]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        background: '#0a0a0a',
        borderRadius: 12,
        display: 'block',
      }}
    />
  );
}

const meta: Meta<typeof ConstellationDemo> = {
  title: 'Patterns/Constellation',
  component: ConstellationDemo,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0a0a0a' }],
    },
  },
  argTypes: {
    nodeCount: {
      control: { type: 'range', min: 50, max: 2000, step: 50 },
      description: 'Number of particles (production uses 9,180)',
    },
    showConnections: {
      control: 'boolean',
      description: 'Show adjacency connections between nearby nodes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConstellationDemo>;

export const Default: Story = {
  args: { nodeCount: 500, showConnections: true },
};

export const Dense: Story = {
  args: { nodeCount: 1500, showConnections: true },
};

export const DustOnly: Story = {
  args: { nodeCount: 2000, showConnections: false },
  parameters: {
    docs: {
      description: {
        story: 'Tier 4 (Dust) — 8,000 micro particles in production, no connections. Pure ambient texture.',
      },
    },
  },
};

export const Minimal: Story = {
  args: { nodeCount: 100, showConnections: true },
  parameters: {
    docs: {
      description: {
        story: 'Reduced motion fallback — fewer nodes, still readable.',
      },
    },
  },
};
