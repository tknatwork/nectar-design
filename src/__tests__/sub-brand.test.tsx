import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import {
  SubBrandProvider,
  useSubBrand,
  useAtmospherePreset,
  useHeroComposition,
  useTagline,
} from '../SubBrandProvider';
import { AtmosphereRegistryProvider } from '../atmosphere/AtmosphereRegistry';
import { SUB_BRANDS, MASTER_DEFAULTS } from '../sub-brands.generated';

// Small probe component that surfaces the active sub-brand context as text.
function Probe() {
  const sb = useSubBrand();
  return (
    <div>
      <span data-testid="name">{sb?.name ?? 'master'}</span>
      <span data-testid="atmosphere">{useAtmospherePreset()}</span>
      <span data-testid="hero">{useHeroComposition()}</span>
      <span data-testid="tagline">{useTagline() ?? 'none'}</span>
    </div>
  );
}

describe('SubBrandProvider', () => {
  it('exposes at least the two seeded sub-brands from the generated registry', () => {
    expect(SUB_BRANDS.ambiguity).toBeDefined();
    expect(SUB_BRANDS['systems-thinking']).toBeDefined();
  });

  it('applies the sub-brand-{name} class + data attribute to its wrapper', () => {
    const { container } = render(
      <SubBrandProvider name="ambiguity" withAtmosphere={false}>
        <p>content</p>
      </SubBrandProvider>,
    );
    const wrapper = container.querySelector('[data-sub-brand]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.dataset.subBrand).toBe('ambiguity');
    expect(wrapper.className).toContain('sub-brand-ambiguity');
  });

  it('provides the active sub-brand record via context', () => {
    render(
      <SubBrandProvider name="ambiguity" withAtmosphere={false}>
        <Probe />
      </SubBrandProvider>,
    );
    expect(screen.getByTestId('name')).toHaveTextContent('ambiguity');
    expect(screen.getByTestId('atmosphere')).toHaveTextContent('ink-route');
    expect(screen.getByTestId('hero')).toHaveTextContent('typography-led');
    expect(screen.getByTestId('tagline')).toHaveTextContent(
      'A case study on systemic uncertainty',
    );
  });

  it('falls back to MASTER_DEFAULTS when no provider is mounted', () => {
    render(<Probe />);
    expect(screen.getByTestId('name')).toHaveTextContent('master');
    expect(screen.getByTestId('atmosphere')).toHaveTextContent(
      MASTER_DEFAULTS.atmosphere,
    );
    expect(screen.getByTestId('hero')).toHaveTextContent(MASTER_DEFAULTS.hero);
  });

  it('nested provider wins for descendant context', () => {
    render(
      <SubBrandProvider name="ambiguity" withAtmosphere={false}>
        <SubBrandProvider name="systems-thinking" withAtmosphere={false}>
          <Probe />
        </SubBrandProvider>
      </SubBrandProvider>,
    );
    expect(screen.getByTestId('name')).toHaveTextContent('systems-thinking');
    expect(screen.getByTestId('atmosphere')).toHaveTextContent('heat');
  });

  it('throws a helpful error for an unknown sub-brand', () => {
    // Silence the React error-boundary console noise for this expected throw.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <SubBrandProvider name="does-not-exist" withAtmosphere={false}>
          <p>x</p>
        </SubBrandProvider>,
      ),
    ).toThrow(/unknown sub-brand "does-not-exist"/);
    spy.mockRestore();
  });
});

describe('AtmosphereRegistry + force-mount', () => {
  it('force-mounts the registered atmosphere component for the active preset', () => {
    const InkRoute = () => <div data-testid="atmosphere-ink">ink</div>;
    render(
      <AtmosphereRegistryProvider components={{ 'ink-route': InkRoute }}>
        <SubBrandProvider name="ambiguity">
          <p>content</p>
        </SubBrandProvider>
      </AtmosphereRegistryProvider>,
    );
    // ambiguity's atmosphere preset is 'ink-route'
    expect(screen.getByTestId('atmosphere-ink')).toBeInTheDocument();
  });

  it('renders no atmosphere when withAtmosphere is false', () => {
    const InkRoute = () => <div data-testid="atmosphere-ink">ink</div>;
    render(
      <AtmosphereRegistryProvider components={{ 'ink-route': InkRoute }}>
        <SubBrandProvider name="ambiguity" withAtmosphere={false}>
          <p>content</p>
        </SubBrandProvider>
      </AtmosphereRegistryProvider>,
    );
    expect(screen.queryByTestId('atmosphere-ink')).not.toBeInTheDocument();
  });

  it('renders nothing for a preset with no registered component', () => {
    // systems-thinking uses 'heat'; register only 'ink-route' → no match, no crash.
    const InkRoute = () => <div data-testid="atmosphere-ink">ink</div>;
    render(
      <AtmosphereRegistryProvider components={{ 'ink-route': InkRoute }}>
        <SubBrandProvider name="systems-thinking">
          <p>content</p>
        </SubBrandProvider>
      </AtmosphereRegistryProvider>,
    );
    expect(screen.queryByTestId('atmosphere-ink')).not.toBeInTheDocument();
  });
});
