import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { computeTheme } from './circadian-engine';
import type { CircadianColors, CircadianConfig } from './types';

type ThemeToken = {
  $value: string;
  $type: 'color';
  $description?: string;
};

type ThemeSnapshot = Record<string, ThemeToken>;

type ThemeFile = {
  theme: Record<string, ThemeToken>;
};

type SnapshotSet = {
  light: ThemeSnapshot;
  dark: ThemeSnapshot;
};

export const MUMBAI_EQUINOX_CONFIG: CircadianConfig = {
  latitude: 19.07,
  longitude: 72.87,
};

const NOON = new Date('2026-03-20T12:00:00+05:30');
const MIDNIGHT = new Date('2026-03-20T00:00:00+05:30');

function resolveThemePath(filename: string): string | URL {
  const candidates = [
    resolve(process.cwd(), 'tokens', 'themes', filename),
    new URL(`../../tokens/themes/${filename}`, import.meta.url),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to locate theme description source for ${filename}.`);
}

function readThemeDescriptions(source: string | URL): Record<string, string | undefined> {
  const { theme } = JSON.parse(readFileSync(source, 'utf8')) as ThemeFile;

  return Object.fromEntries(
    Object.entries(theme).map(([key, token]) => [key, token.$description]),
  );
}

function toThemeSnapshot(
  colors: CircadianColors,
  descriptions: Record<string, string | undefined>,
): ThemeSnapshot {
  return Object.fromEntries(
    Object.entries(colors).map(([cssVar, value]) => {
      const themeKey = cssVar.replace(/^--/, '');
      const description = descriptions[themeKey];
      const token: ThemeToken = {
        $value: value,
        $type: 'color',
        ...(description ? { $description: description } : {}),
      };

      return [themeKey, token];
    }),
  );
}

export function generateSnapshots(config: CircadianConfig = MUMBAI_EQUINOX_CONFIG): SnapshotSet {
  const lightDescriptions = readThemeDescriptions(resolveThemePath('light.json'));
  const darkDescriptions = readThemeDescriptions(resolveThemePath('dark.json'));

  const lightOutput = computeTheme(config, NOON);
  const darkOutput = computeTheme(config, MIDNIGHT);

  return {
    light: toThemeSnapshot(lightOutput.colors, lightDescriptions),
    dark: toThemeSnapshot(darkOutput.colors, darkDescriptions),
  };
}

export function writeSnapshots(
  outputDir: string,
  config: CircadianConfig = MUMBAI_EQUINOX_CONFIG,
): void {
  const snapshots = generateSnapshots(config);
  const targetDir = resolve(outputDir);

  mkdirSync(targetDir, { recursive: true });

  writeFileSync(
    join(targetDir, 'light.json'),
    `${JSON.stringify({ theme: snapshots.light }, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    join(targetDir, 'dark.json'),
    `${JSON.stringify({ theme: snapshots.dark }, null, 2)}\n`,
    'utf8',
  );
}
