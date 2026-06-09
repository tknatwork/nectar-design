import { SUB_BRANDS } from './sub-brands.generated';

/**
 * Resolve the sub-brand slug whose registered routes claim this pathname, or
 * `null` for the master brand. Route-driven from the SUB_BRANDS registry
 * (single source of truth: tokens/sub-brands/*.json) so consumers never
 * hardcode which routes map to which sub-brand — adding a sub-brand + its
 * routes to the registry is enough for it to flow into the app.
 *
 * Matching is exact or path-prefix (`/p` matches `/p` and `/p/x`, never
 * `/ptwo`), so sibling routes can't false-match.
 *
 * @example
 *   resolveSubBrandSlug('/projects/systems-thinking-experiments') // 'systems-thinking'
 *   resolveSubBrandSlug('/about')                                  // null
 */
export function resolveSubBrandSlug(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  for (const [slug, record] of Object.entries(SUB_BRANDS)) {
    if (record.routes.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
      return slug;
    }
  }
  return null;
}
