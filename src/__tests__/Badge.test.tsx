import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from '../components/Badge';

describe('Badge', () => {
  it('renders with children inside a span', () => {
    render(<Badge>Status</Badge>);

    const badge = screen.getByText('Status');

    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('SPAN');
  });

  it('applies default classes', () => {
    render(<Badge>Default badge</Badge>);

    const badge = screen.getByText('Default badge');

    expect(badge).toHaveClass('bg-muted');
    expect(badge).toHaveClass('h-6');
  });

  it('applies intent variants', () => {
    const { rerender } = render(<Badge intent="default">Default</Badge>);

    expect(screen.getByText('Default')).toHaveClass('bg-muted');

    rerender(<Badge intent="primary">Primary</Badge>);
    expect(screen.getByText('Primary')).toHaveClass('bg-primary/10');

    rerender(<Badge intent="accent">Accent</Badge>);
    expect(screen.getByText('Accent')).toHaveClass('bg-accent/10');

    rerender(<Badge intent="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-success/10');

    rerender(<Badge intent="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-warning/10');

    rerender(<Badge intent="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive/10');
  });

  it('applies size variants', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);

    expect(screen.getByText('Small')).toHaveClass('h-5');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('h-6');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('h-7');
  });

  it('merges a custom className', () => {
    render(<Badge className="uppercase">Custom badge</Badge>);

    expect(screen.getByText('Custom badge')).toHaveClass('uppercase');
  });
});
