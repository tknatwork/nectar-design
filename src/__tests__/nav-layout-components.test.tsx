import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Stack } from '../components/Stack';
import { Container } from '../components/Container';
import { Grid } from '../components/Grid';
import { Divider } from '../components/Divider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { Breadcrumbs } from '../components/Breadcrumbs';

// ── Stack ──────────────────────────────────────────────────────────────────────

describe('Stack', () => {
  it('renders children in a flex container', () => {
    const { container } = render(
      <Stack>
        <div>A</div>
        <div>B</div>
      </Stack>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('flex');
    expect(el.className).toContain('flex-col');
  });

  it('applies horizontal direction', () => {
    const { container } = render(<Stack direction="horizontal">Items</Stack>);
    expect((container.firstChild as HTMLElement).className).toContain('flex-row');
  });

  it('applies gap variant', () => {
    const { container } = render(<Stack gap="lg">Items</Stack>);
    expect((container.firstChild as HTMLElement).className).toContain('gap-lg');
  });

  it('applies responsive direction', () => {
    const { container } = render(<Stack responsive="tablet">Items</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('tablet:flex-row');
  });

  it('passes dir prop', () => {
    const { container } = render(<Stack dir="rtl">Items</Stack>);
    expect((container.firstChild as HTMLElement)).toHaveAttribute('dir', 'rtl');
  });
});

// ── Container ──────────────────────────────────────────────────────────────────

describe('Container', () => {
  it('renders with token-based max-width class', () => {
    const { container } = render(<Container>Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('mx-auto');
    expect(el.className).toContain('max-w-container-lg');
  });

  it('applies size variant', () => {
    const { container } = render(<Container size="sm">Content</Container>);
    expect((container.firstChild as HTMLElement).className).toContain('max-w-container-sm');
  });

  it('applies responsive padding by default', () => {
    const { container } = render(<Container>Content</Container>);
    expect((container.firstChild as HTMLElement).className).toContain('px-md');
  });

  it('passes dir prop', () => {
    const { container } = render(<Container dir="rtl">Content</Container>);
    expect((container.firstChild as HTMLElement)).toHaveAttribute('dir', 'rtl');
  });
});

// ── Grid ────────────────────────────────────────────────────────────────────────

describe('Grid', () => {
  it('renders as a grid container', () => {
    const { container } = render(<Grid><div>A</div></Grid>);
    expect((container.firstChild as HTMLElement).className).toContain('grid');
  });

  it('applies column count', () => {
    const { container } = render(<Grid cols={3}>Items</Grid>);
    expect((container.firstChild as HTMLElement).className).toContain('grid-cols-3');
  });

  it('applies responsive preset', () => {
    const { container } = render(<Grid responsive="desktop">Items</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('tablet-landscape:grid-cols-3');
  });

  it('applies token-based gap', () => {
    const { container } = render(<Grid gap="lg">Items</Grid>);
    expect((container.firstChild as HTMLElement).className).toContain('gap-lg');
  });

  it('passes dir prop', () => {
    const { container } = render(<Grid dir="rtl">Items</Grid>);
    expect((container.firstChild as HTMLElement)).toHaveAttribute('dir', 'rtl');
  });
});

// ── Divider ────────────────────────────────────────────────────────────────────

describe('Divider', () => {
  it('renders with role="separator"', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders horizontal by default', () => {
    render(<Divider />);
    const hr = screen.getByRole('separator');
    expect(hr).toHaveAttribute('aria-orientation', 'horizontal');
    expect(hr.className).toContain('h-px');
  });

  it('renders vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    const hr = screen.getByRole('separator');
    expect(hr).toHaveAttribute('aria-orientation', 'vertical');
    expect(hr.className).toContain('w-px');
  });
});

// ── Tabs ───────────────────────────────────────────────────────────────────────

describe('Tabs', () => {
  it('renders tab triggers and content', () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">Tab 1</TabsTrigger>
          <TabsTrigger value="two">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Content 1</TabsContent>
        <TabsContent value="two">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('switches content on tab click', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">Tab 1</TabsTrigger>
          <TabsTrigger value="two">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Content 1</TabsContent>
        <TabsContent value="two">Content 2</TabsContent>
      </Tabs>
    );

    await user.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">Tab 1</TabsTrigger>
          <TabsTrigger value="two">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Content 1</TabsContent>
        <TabsContent value="two">Content 2</TabsContent>
      </Tabs>
    );

    screen.getByText('Tab 1').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Tab 2')).toHaveFocus();
  });
});

// ── Breadcrumbs ────────────────────────────────────────────────────────────────

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Nectar Design' },
  ];

  it('renders nav with aria-label', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('renders all items', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Nectar Design')).toBeInTheDocument();
  });

  it('marks last item as current page', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Nectar Design')).toHaveAttribute('aria-current', 'page');
  });

  it('renders links for non-last items with href', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Projects').closest('a')).toHaveAttribute('href', '/projects');
    expect(screen.getByText('Nectar Design').closest('a')).toBeNull();
  });

  it('passes axe audit', async () => {
    const { container } = render(<Breadcrumbs items={items} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
