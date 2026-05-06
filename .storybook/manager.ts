/**
 * manager.ts — applies the Nectar theme to Storybook's manager UI.
 *
 * Storybook splits its rendering into two surfaces:
 *   - the "manager" (top bar + sidebar + addons panel) — themed here
 *   - the "preview" / canvas (where stories render) — handled by
 *     preview.ts + preview-head.html (engine CSS injected directly)
 *
 * `addons.setConfig` is the canonical hook for manager-UI tweaks;
 * the theme prop ties our `nectarTheme` to the manager's chrome.
 */

import { addons } from 'storybook/internal/manager-api';

import { nectarTheme } from './theme';

addons.setConfig({
  theme: nectarTheme,
  // Sidebar — show the section grouping + collapse-by-default for a
  // calmer first-load (the live design system has a lot of stories;
  // collapsed groups feel less like a wall and match the kit's intent
  // of foregrounding the breadcrumb at the top).
  sidebar: {
    showRoots: true,
  },
  // Addons panel — bottom by default; the kit's design uses a right-
  // side panel which Storybook can do via panelPosition: 'right'.
  panelPosition: 'right',
});
