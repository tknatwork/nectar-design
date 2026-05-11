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
  },
  /**
   * Vite tuning for the Storybook build.
   *
   * Disables Rolldown's experimental plugin-timing check. Storybook's
   * plugin stack legitimately accounts for ~25% of build time (the
   * project-annotations-plugin alone). The check fires a
   * `Vite [PLUGIN_TIMINGS] Warning: Your build spent significant time
   * in plugins` notice on every build, listing internal Storybook
   * plugins we don't own. Informational only — disabling silences
   * the noise without affecting any actual behavior. Same fix mirrored
   * in mp's `app/.storybook/main.ts` per the ADR 0015 dual-source policy.
   *
   * Correct option path per Rolldown docs:
   *   build.rollupOptions.checks.plugintimings = false
   * (https://rolldown.rs/options/checks#plugintimings)
   * NOT `experimental.checkPluginTimings` — that's not a valid Rolldown
   * key and Vite reports "Invalid input options" if used. The `checks`
   * field isn't in vanilla Vite/Rollup TS types yet, so we extend via
   * intersection type to keep ESLint's `no-explicit-any` rule happy.
   */
  viteFinal: async (config) => {
    config.build = config.build ?? {};
    type RollupOptionsWithChecks = NonNullable<typeof config.build.rollupOptions> & {
      checks?: { plugintimings?: boolean };
    };
    const rollupOpts: RollupOptionsWithChecks = config.build.rollupOptions ?? {};
    rollupOpts.checks = { ...(rollupOpts.checks ?? {}), plugintimings: false };
    config.build.rollupOptions = rollupOpts;
    return config;
  }
};
export default config;