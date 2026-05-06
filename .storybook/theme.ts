/**
 * theme.ts — Nectar Storybook chrome theme (manager only).
 *
 * IMPORTANT: This file imports `storybook/internal/theming` which only
 * resolves under the manager build conditions. It must NOT be imported
 * by preview.ts or anything in the preview build chain — that triggers:
 *   "./internal/theming" is not exported under the conditions
 *   [storybook, stories, test, module, browser, production, import]
 *
 * Both manager.ts (which sets the active theme) and preview.ts (which
 * needs a docs theme) read color values from `./theme-colors.ts`. Only
 * this file calls `create()` and is imported only by manager.ts.
 *
 * See `kits/storybook.html` for the design intent: the chrome uses
 * live engine vars throughout for full Heat × Depth breathing.
 * Storybook's manager runs outside the engine runtime, so theme.ts
 * passes static hex (matching the engine's default snapshot at the
 * visitor's OS prefers-color-scheme), and `manager-head.html` injects
 * the engine vars + glass overrides so backdrop-filter / borders /
 * dotted backgrounds match the kit at runtime.
 */

import { create } from 'storybook/internal/theming';
import { themeBase } from './theme-colors';

export const nectarTheme = create(themeBase);
