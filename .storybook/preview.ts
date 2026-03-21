import type { Preview } from '@storybook/react-vite'

// Import design tokens so components render with correct styles
import '../css/tokens.css';
import '../css/theme.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    viewport: {
      viewports: {
        mobile: { name: 'Mobile (390px)', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet (768px)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (1024px)', styles: { width: '1024px', height: '768px' } },
        wide: { name: 'Wide (1440px)', styles: { width: '1440px', height: '900px' } },
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;