import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-vite",
  // Serve ../public + ../docs/specimens as static assets.
  // - ../public → / (default mapping; ships /.well-known/security.txt RFC 9116)
  // - ../docs/specimens → /specimens (HTML specimen pages + fonts referenced
  //   by preview-head.html @font-face declarations and foundations MDX)
  "staticDirs": [
    "../public",
    {
      "from": "../docs/specimens",
      "to": "/specimens"
    }
  ]
};
export default config;