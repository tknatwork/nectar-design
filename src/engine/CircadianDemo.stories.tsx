import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useMemo, useCallback } from 'react';
import { computeTheme, computeThemeVars, getState } from './circadian-engine';
import { DEFAULT_CONFIG } from './types';
import type { CircadianConfig, CircadianOutput, CircadianState, CircadianVarMap } from './types';

/* ─── Helpers ─── */
function timeLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function dateForMinutes(minutes: number): Date {
  // Mumbai equinox — March 20, 2026
  const d = new Date(2026, 2, 20, 0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

/* ─── Color Swatch ─── */
function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: value,
          border: '1px solid rgba(128,128,128,0.3)',
          flexShrink: 0,
        }}
      />
      <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ opacity: 0.7 }}>{value}</div>
      </div>
    </div>
  );
}

/* ─── Solar Info Panel ─── */
function SolarInfo({ state }: { state: CircadianState }) {
  const rows = [
    ['Phase', state.phase],
    ['Vision Regime', state.visionRegime],
    ['Kelvin', `${state.kelvin.toFixed(0)}K`],
    ['Intensity', `${(state.intensity * 100).toFixed(1)}%`],
    ['Elevation', `${((state.elevation * 180) / Math.PI).toFixed(1)}°`],
    ['Base Color', `oklch(${state.baseColor.l.toFixed(3)} ${state.baseColor.c.toFixed(3)} ${state.baseColor.h.toFixed(1)})`],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13, fontFamily: 'monospace' }}>
      {rows.map(([label, val]) => (
        <div key={label as string} style={{ display: 'contents' }}>
          <span style={{ opacity: 0.6 }}>{label}</span>
          <span style={{ fontWeight: 500 }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Typography Panel ─── */
function TypographyPanel({ output }: { output: CircadianOutput }) {
  const t = output.typography;
  const rows: [string, string][] = [
    ['Body Weight', t['--typo-body-weight']],
    ['Display Weight', t['--typo-display-weight']],
    ['Body Tracking', t['--typo-body-tracking']],
    ['Display Tracking', t['--typo-display-tracking']],
    ['Body Leading', t['--typo-body-leading']],
    ['Display Leading', t['--typo-display-leading']],
    ['Body Size Adjust', t['--typo-body-size-adjust']],
    ['Display Size Adjust', t['--typo-display-size-adjust']],
    ['Optical Size', t['--typo-optical-size']],
    ['Contrast Ratio', t['--typo-contrast-ratio']],
  ];
  return (
    <div>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Typography Adaptation</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 12px', fontSize: 12, fontFamily: 'monospace' }}>
        {rows.map(([label, val]) => (
          <div key={label} style={{ display: 'contents' }}>
            <span style={{ opacity: 0.6 }}>{label}</span>
            <span>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Motion + Shadow Panel ─── */
function MotionShadowPanel({ output }: { output: CircadianOutput }) {
  const m = output.motion;
  const s = output.shadows;
  return (
    <div>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Motion & Shadow</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 12px', fontSize: 12, fontFamily: 'monospace' }}>
        <span style={{ opacity: 0.6 }}>Duration Scale</span><span>{m['--motion-duration-scale']}</span>
        <span style={{ opacity: 0.6 }}>Intensity Scale</span><span>{m['--motion-intensity-scale']}</span>
        <span style={{ opacity: 0.6 }}>Motion Reduced</span><span>{m['--motion-reduced']}</span>
        <span style={{ opacity: 0.6 }}>Shadow Opacity</span><span>{s['--shadow-ambient-opacity']}</span>
        <span style={{ opacity: 0.6 }}>Shadow Temp</span><span>{s['--shadow-color-temperature']}</span>
        <span style={{ opacity: 0.6 }}>Shadow Spread</span><span>{s['--shadow-spread-scale']}</span>
      </div>
    </div>
  );
}

/* ─── Live Preview (applies vars to a mini UI) ─── */
function LivePreview({ vars, output }: { vars: CircadianVarMap; output: CircadianOutput }) {
  const bg = vars['--bg'] || '#fff';
  const fg = vars['--fg'] || '#000';
  const primary = vars['--primary'] || '#0066cc';
  const surface = vars['--surface'] || '#f5f5f5';
  const border = vars['--border'] || '#ddd';
  const muted = vars['--muted-fg'] || '#666';
  const t = output.typography;

  return (
    <div
      style={{
        background: bg,
        color: fg,
        padding: 24,
        borderRadius: 12,
        border: `1px solid ${border}`,
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 400,
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: Number(t['--typo-display-weight']),
          letterSpacing: t['--typo-display-tracking'],
          lineHeight: Number(t['--typo-display-leading']),
          margin: '0 0 8px',
        }}
      >
        Living Interface
      </h2>
      <p
        style={{
          fontSize: 15,
          fontWeight: Number(t['--typo-body-weight']),
          letterSpacing: t['--typo-body-tracking'],
          lineHeight: Number(t['--typo-body-leading']),
          margin: '0 0 16px',
          color: muted,
        }}
      >
        This preview adapts to the circadian engine output. Typography weight, tracking, and leading shift with the sun.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            background: primary,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Primary Action
        </button>
        <button
          style={{
            background: surface,
            color: fg,
            border: `1px solid ${border}`,
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Secondary
        </button>
      </div>
    </div>
  );
}

/* ─── 24-Hour Color Strip ─── */
function ColorStrip({ config }: { config: CircadianConfig }) {
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const date = dateForMinutes(i * 60);
      const vars = computeThemeVars(config, date);
      return { hour: i, bg: vars['--bg'], fg: vars['--fg'], primary: vars['--primary'] };
    });
  }, [config]);

  return (
    <div>
      <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>24-Hour Background Curve</h4>
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 40 }}>
        {hours.map(({ hour, bg }) => (
          <div
            key={hour}
            style={{ flex: 1, background: bg }}
            title={`${String(hour).padStart(2, '0')}:00`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', fontSize: 9, fontFamily: 'monospace', opacity: 0.5, marginTop: 2 }}>
        {hours.filter((_, i) => i % 4 === 0).map(({ hour }) => (
          <span key={hour} style={{ flex: 4 }}>{String(hour).padStart(2, '0')}:00</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Demo Component ─── */
function CircadianExplorer({
  latitude,
  longitude,
  brandHue,
  contrastFloor,
}: {
  latitude: number;
  longitude: number;
  brandHue: number;
  contrastFloor: 'AA' | 'AAA';
}) {
  const [minutes, setMinutes] = useState(720); // noon default

  const config: CircadianConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, latitude, longitude, brandHue, contrastFloor }),
    [latitude, longitude, brandHue, contrastFloor],
  );

  const date = useMemo(() => dateForMinutes(minutes), [minutes]);
  const state = useMemo(() => getState(config, date), [config, date]);
  const output = useMemo(() => computeTheme(config, date), [config, date]);
  const vars = useMemo(() => computeThemeVars(config, date), [config, date]);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMinutes(Number(e.target.value));
  }, []);

  // Group colors for display (using CSS variable keys)
  const colorGroups = useMemo(() => {
    const c = output.colors;
    return {
      'Background': { '--bg': c['--bg'], '--surface': c['--surface'], '--muted': c['--muted'], '--input': c['--input'] },
      'Foreground': { '--fg': c['--fg'], '--surface-fg': c['--surface-fg'], '--muted-fg': c['--muted-fg'] },
      'Brand': { '--primary': c['--primary'], '--primary-fg': c['--primary-fg'], '--accent': c['--accent'], '--ring': c['--ring'] },
      'Semantic': { '--destructive': c['--destructive'], '--destructive-fg': c['--destructive-fg'], '--success': c['--success'], '--success-fg': c['--success-fg'], '--warning': c['--warning'], '--warning-fg': c['--warning-fg'] },
      'Chrome': { '--border': c['--border'] },
    };
  }, [output.colors]);

  const containerBg = state.intensity > 0.3 ? '#f8f8f8' : '#1a1a1a';
  const containerFg = state.intensity > 0.3 ? '#222' : '#ddd';

  return (
    <div style={{ padding: 24, background: containerBg, color: containerFg, minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Time Slider */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Circadian Engine Explorer</h3>
          <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', opacity: 0.8 }}>
            {timeLabel(minutes)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1439}
          value={minutes}
          onChange={handleSlider}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace', opacity: 0.4 }}>
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
        </div>
      </div>

      {/* Top row: Solar Info + Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Solar State</h4>
          <SolarInfo state={state} />
        </div>
        <LivePreview vars={vars} output={output} />
      </div>

      {/* 24-hour strip */}
      <div style={{ marginBottom: 24 }}>
        <ColorStrip config={config} />
      </div>

      {/* Bottom row: Colors + Typography + Motion */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24 }}>
        {/* Color Palette */}
        <div>
          <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Color Palette (33 vars)</h4>
          {Object.entries(colorGroups).map(([group, colors]) => (
            <div key={group} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {group}
              </div>
              {Object.entries(colors).map(([name, value]) => (
                <Swatch key={name} name={name} value={value as string} />
              ))}
            </div>
          ))}
        </div>

        {/* Typography */}
        <TypographyPanel output={output} />

        {/* Motion + Shadow */}
        <MotionShadowPanel output={output} />
      </div>
    </div>
  );
}

/* ─── Story Config ─── */
const meta: Meta<typeof CircadianExplorer> = {
  title: 'Engine/Circadian Explorer',
  component: CircadianExplorer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive explorer for the Biomimetic Adaptive Theme engine. Drag the time slider to see how 49 CSS variables (33 color + 10 typography + 3 motion + 3 shadow) adapt across a 24-hour cycle based on solar physics.',
      },
    },
  },
  argTypes: {
    latitude: { control: { type: 'range', min: -90, max: 90, step: 0.1 }, description: 'Latitude (°N)' },
    longitude: { control: { type: 'range', min: -180, max: 180, step: 0.1 }, description: 'Longitude (°E)' },
    brandHue: { control: { type: 'range', min: 0, max: 360, step: 1 }, description: 'Brand hue (degrees)' },
    contrastFloor: { control: 'radio', options: ['AA', 'AAA'], description: 'WCAG contrast level' },
  },
};

export default meta;
type Story = StoryObj<typeof CircadianExplorer>;

/** Default: Mumbai, brand hue 45 (warm amber) */
export const Mumbai: Story = {
  args: { latitude: 19.07, longitude: 72.87, brandHue: 45, contrastFloor: 'AA' },
};

/** Helsinki — extreme day/night variation at high latitude */
export const Helsinki: Story = {
  args: { latitude: 60.17, longitude: 24.94, brandHue: 45, contrastFloor: 'AA' },
};

/** AAA contrast — stricter WCAG level */
export const HighContrast: Story = {
  args: { latitude: 19.07, longitude: 72.87, brandHue: 45, contrastFloor: 'AAA' },
};

/** Cool brand hue — blue (210°) instead of warm amber */
export const CoolBrand: Story = {
  args: { latitude: 19.07, longitude: 72.87, brandHue: 210, contrastFloor: 'AA' },
};
