import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Heading } from '../components/Heading';
import { Link } from '../components/Link';
import { Avatar } from '../components/Avatar';
import { Tag } from '../components/Tag';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { List, ListItem } from '../components/List';

// ── Heading ────────────────────────────────────────────────────────────────────

describe('Heading', () => {
  it('renders as h2 by default', () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title');
  });

  it('renders correct heading level', () => {
    render(<Heading level={1}>Title</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('allows tag override via as prop', () => {
    render(<Heading level={1} as="h3">Title</Heading>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('applies level-specific styles', () => {
    const { container } = render(<Heading level={1}>Big</Heading>);
    expect((container.firstChild as HTMLElement).className).toContain('text-4xl');
  });
});

// ── Link ───────────────────────────────────────────────────────────────────────

describe('Link', () => {
  it('renders as an anchor', () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/about');
  });

  it('adds external attributes', () => {
    render(<Link href="https://example.com" external>Example</Link>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not add external attributes by default', () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
  });

  it('passes axe audit', async () => {
    const { container } = render(<Link href="/about">About us</Link>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ── Avatar ─────────────────────────────────────────────────────────────────────

describe('Avatar', () => {
  it('renders with role="img" and aria-label', () => {
    render(<Avatar alt="John Doe" />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('aria-label', 'John Doe');
  });

  it('shows initials when no src', () => {
    render(<Avatar alt="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows custom fallback', () => {
    render(<Avatar alt="John Doe" fallback="?" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies size variant', () => {
    const { container } = render(<Avatar alt="Test" size="lg" />);
    expect((container.firstChild as HTMLElement).className).toContain('h-12');
  });
});

// ── Tag ────────────────────────────────────────────────────────────────────────

describe('Tag', () => {
  it('renders text content', () => {
    render(<Tag>React</Tag>);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('shows remove button when onRemove provided', () => {
    render(<Tag onRemove={() => {}}>React</Tag>);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>React</Tag>);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not show remove button without onRemove', () => {
    render(<Tag>React</Tag>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

// ── Table ──────────────────────────────────────────────────────────────────────

describe('Table', () => {
  it('renders a semantic table', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>Engineer</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('cell')).toHaveLength(2);
  });

  it('passes axe audit', async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ── List ───────────────────────────────────────────────────────────────────────

describe('List', () => {
  it('renders as ul by default', () => {
    render(
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders as ol when ordered', () => {
    const { container } = render(
      <List ordered>
        <ListItem>First</ListItem>
      </List>
    );
    expect(container.querySelector('ol')).toBeInTheDocument();
  });

  it('applies divided variant', () => {
    const { container } = render(
      <List variant="divided">
        <ListItem>A</ListItem>
        <ListItem>B</ListItem>
      </List>
    );
    expect((container.firstChild as HTMLElement).className).toContain('divide-y');
  });
});

// ── Icon ──────────────────────────────────────────────────────────────────────

// Mock Iconify to avoid CDN fetches in tests
vi.mock('@iconify/react', () => ({
  Icon: (props: Record<string, unknown>) => {
    const { icon, ...rest } = props;
    return <span data-icon={icon} {...rest} />;
  },
}));

import { Icon } from '../components/Icon';

describe('Icon', () => {
  it('renders with default size (md = size-5)', () => {
    const { container } = render(<Icon icon="ph:house" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('size-5');
  });

  it('applies size variant', () => {
    const { container } = render(<Icon icon="ph:house" size="lg" />);
    expect((container.firstChild as HTMLElement).className).toContain('size-6');
  });

  it('is decorative by default (aria-hidden)', () => {
    const { container } = render(<Icon icon="ph:house" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('becomes semantic with aria-label', () => {
    const { container } = render(<Icon icon="ph:house" aria-label="Home" />);
    const el = container.firstChild as HTMLElement;
    expect(el).not.toHaveAttribute('aria-hidden');
    expect(el).toHaveAttribute('aria-label', 'Home');
    expect(el).toHaveAttribute('role', 'img');
  });

  it('passes custom className', () => {
    const { container } = render(<Icon icon="ph:house" className="text-primary" />);
    expect((container.firstChild as HTMLElement).className).toContain('text-primary');
  });

  it('renders the correct icon identifier', () => {
    const { container } = render(<Icon icon="lucide:settings" />);
    expect(container.firstChild).toHaveAttribute('data-icon', 'lucide:settings');
  });
});
