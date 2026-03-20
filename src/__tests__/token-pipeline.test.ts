import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const TOKENS_CSS = resolve(ROOT, 'css/tokens.css');

describe('Token build pipeline', () => {
  it('tokens.css exists', () => {
    expect(existsSync(TOKENS_CSS)).toBe(true);
  });

  it('produces at least 400 CSS custom properties', () => {
    const css = readFileSync(TOKENS_CSS, 'utf-8');
    const vars = css.match(/^\s*--/gm) ?? [];
    expect(vars.length).toBeGreaterThanOrEqual(400);
  });

  it('includes seed tier tokens', () => {
    const css = readFileSync(TOKENS_CSS, 'utf-8');
    expect(css).toContain('--seed-');
  });

  it('includes component tier tokens (button, card, input, badge)', () => {
    const css = readFileSync(TOKENS_CSS, 'utf-8');
    expect(css).toContain('--button-');
    expect(css).toContain('--card-');
    expect(css).toContain('--input-');
    expect(css).toContain('--badge-');
  });

  it('includes theme tokens for light and dark', () => {
    const css = readFileSync(TOKENS_CSS, 'utf-8');
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="dark"]');
  });
});
