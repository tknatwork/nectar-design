import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from '../components/Card';

describe('Card', () => {
  it('renders with children inside a div', () => {
    render(<Card>Card content</Card>);

    const card = screen.getByText('Card content');

    expect(card).toBeInTheDocument();
    expect(card.tagName).toBe('DIV');
  });

  it('applies default classes', () => {
    render(<Card>Default card</Card>);

    const card = screen.getByText('Default card');

    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border-border');
    expect(card).toHaveClass('bg-surface');
    expect(card).toHaveClass('p-6');
  });

  it('applies variant options', () => {
    const { rerender } = render(<Card variant="default">Default variant</Card>);

    expect(screen.getByText('Default variant')).not.toHaveClass(
      'cursor-pointer'
    );

    rerender(<Card variant="interactive">Interactive card</Card>);
    const interactiveCard = screen.getByText('Interactive card');
    expect(interactiveCard).toHaveClass('hover:border-primary');
    expect(interactiveCard).toHaveClass('cursor-pointer');

    rerender(<Card variant="elevated">Elevated card</Card>);
    const elevatedCard = screen.getByText('Elevated card');
    expect(elevatedCard).toHaveClass('shadow-sm');
    expect(elevatedCard).toHaveClass('hover:shadow-md');
  });

  it('applies padding variants', () => {
    const { rerender } = render(<Card padding="none">No padding</Card>);

    expect(screen.getByText('No padding')).not.toHaveClass('p-4');
    expect(screen.getByText('No padding')).not.toHaveClass('p-6');
    expect(screen.getByText('No padding')).not.toHaveClass('p-8');

    rerender(<Card padding="sm">Small padding</Card>);
    expect(screen.getByText('Small padding')).toHaveClass('p-4');

    rerender(<Card padding="md">Medium padding</Card>);
    expect(screen.getByText('Medium padding')).toHaveClass('p-6');

    rerender(<Card padding="lg">Large padding</Card>);
    expect(screen.getByText('Large padding')).toHaveClass('p-8');
  });

  it('merges a custom className', () => {
    render(<Card className="ring-1">Custom card</Card>);

    expect(screen.getByText('Custom card')).toHaveClass('ring-1');
  });
});
