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
  ],
  // Opt out of Storybook's anonymous usage telemetry. The default
  // collects coarse statistics on addons, framework, builder, story
  // counts, etc., and reports to Storybook's analytics endpoint on
  // each `storybook dev` and `build-storybook` invocation. We don't
  // need to participate — same posture as Turborepo + Next.js +
  // Vercel CLI elsewhere in this repo.
  //
  // Affects BOTH consumers of this config:
  //   - nd standalone Storybook (`pnpm storybook` here)
  //   - mp's unified Storybook (deployed to design.tusharkantnaik.com
  //     per ADR 0015 — builds via the submodule path)
  //
  // Ref: https://storybook.js.org/docs/configure/telemetry
  "core": {
    "disableTelemetry": true
  }
};
export default config;