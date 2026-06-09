/**
 * Animation Preferences — 3-tier device detection + user override.
 *
 * Mobile (<768px): all animations OFF, no toggle
 * Tablet (768-1023px): AtmosphereOrbs ON, canvas OFF, toggle for orbs
 * Desktop (>=1024px): auto-detect by hardware, toggle for all
 *
 * HeatEngine color shifts are always active (CSS-only, negligible cost).
 */

export type AnimationPref = 'on' | 'off' | 'auto';
export type DeviceTier = 'mobile' | 'tablet' | 'desktop';

const STORAGE_KEY = 'animation-enabled';

export function getDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (w < 768 || (coarse && w < 768)) return 'mobile';
  if ((w >= 768 && w < 1024) || (coarse && w >= 768)) return 'tablet';
  return 'desktop';
}

export function getAnimationPref(): AnimationPref {
  if (typeof window === 'undefined') return 'auto';
  return (localStorage.getItem(STORAGE_KEY) as AnimationPref) || 'auto';
}

export const ANIMATION_CHANGE_EVENT = 'animation-pref-change';

export function setAnimationPref(pref: 'on' | 'off', origin?: { x: number; y: number }) {
  localStorage.setItem(STORAGE_KEY, pref);
  window.dispatchEvent(new CustomEvent(ANIMATION_CHANGE_EVENT, { detail: { origin } }));
}

export function shouldAnimateCanvas(): boolean {
  const tier = getDeviceTier();
  if (tier !== 'desktop') return false;

  const pref = getAnimationPref();
  if (pref === 'on') return true;
  if (pref === 'off') return false;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as { deviceMemory?: number };
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  if (navigator.hardwareConcurrency < 4) return false;
  if (nav.deviceMemory === undefined && window.innerWidth < 1280) return false;
  return true;
}

export function shouldAnimateOrbs(): boolean {
  const tier = getDeviceTier();
  if (tier === 'mobile') return false;

  const pref = getAnimationPref();
  if (pref === 'on') return true;
  if (pref === 'off') return false;

  if (tier === 'tablet') return true;
  return shouldAnimateCanvas();
}

export function hasToggle(): boolean {
  return getDeviceTier() !== 'mobile';
}

export function toggleAnimation(origin?: { x: number; y: number }): boolean {
  const tier = getDeviceTier();
  if (tier === 'mobile') return false;

  const currentlyOn = tier === 'tablet' ? shouldAnimateOrbs() : shouldAnimateCanvas();
  setAnimationPref(currentlyOn ? 'off' : 'on', origin);
  return !currentlyOn;
}
