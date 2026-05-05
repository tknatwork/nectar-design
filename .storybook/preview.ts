import type { Preview } from '@storybook/react-vite'

// Import design tokens so components render with correct styles
import '../css/tokens.css';
import '../css/theme.css';
// Circadian engine adds 16 typography + motion + shadow vars from solar
// position. The Storybook canvas inherits the engine's default state
// (depth=100, heat=0) via preview-head.html; circadian provides the
// runtime layer atop that. Components that opt into useCircadian()
// will read the live values; components that don't ignore them.
import '../css/circadian.css';

const preview: Preview = {
  parameters: {
    /* ─── Backgrounds — Heat × Depth axes as a Storybook addon ─────────
       Hooks into Storybook's built-in `backgrounds` parameter so stories
       can switch between the four corners of the engine's design space
       (heat 0/100 × depth 0/100) without leaving the canvas. The values
       are computed from the same formulas the live engine uses; if a
       story needs a non-corner state, it can override `parameters.
       backgrounds.default` per-story. */
    backgrounds: {
      default: 'engine-dark',
      values: [
        { name: 'engine-dark',       value: 'oklch(0.15 0.08 250)' }, // heat=0,   depth=100
        { name: 'engine-light',      value: 'oklch(0.96 0.02 250)' }, // heat=0,   depth=0
        { name: 'engine-warm-dark',  value: 'oklch(0.15 0.08 40)'  }, // heat=100, depth=100
        { name: 'engine-warm-light', value: 'oklch(0.96 0.02 40)'  }, // heat=100, depth=0
      ],
    },

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    /* Viewport breakpoints match the live site's responsive scale. */
    viewport: {
      viewports: {
        mobile:  { name: 'Mobile (390px)',  styles: { width: '390px',  height: '844px' } },
        tablet:  { name: 'Tablet (768px)',  styles: { width: '768px',  height: '1024px' } },
        desktop: { name: 'Desktop (1024px)', styles: { width: '1024px', height: '768px' } },
        wide:    { name: 'Wide (1440px)',    styles: { width: '1440px', height: '900px' } },
      },
    },

    /* Layout — the canvas-stage style padding lives in preview-head.html
       so docs MDX gets the same spacing as story canvases. `centered`
       is the natural choice for component stories, which mirrors the
       kit's flex centered .canvas-stage. */
    layout: 'centered',

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;