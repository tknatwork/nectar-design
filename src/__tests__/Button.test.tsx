import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../components/Button';

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);

    expect(
      screen.getByRole('button', { name: 'Click me' })
    ).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Button>Default button</Button>);

    const button = screen.getByRole('button', { name: 'Default button' });

    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-10');
  });

  it('applies each intent variant', () => {
    const { rerender } = render(<Button intent="primary">Primary</Button>);

    expect(screen.getByRole('button', { name: 'Primary' })).toHaveClass(
      'bg-primary'
    );

    rerender(<Button intent="accent">Accent</Button>);
    expect(screen.getByRole('button', { name: 'Accent' })).toHaveClass(
      'bg-accent'
    );

    rerender(<Button intent="outline">Outline</Button>);
    const outlineButton = screen.getByRole('button', { name: 'Outline' });
    expect(outlineButton).toHaveClass('border');
    expect(outlineButton).toHaveClass('bg-transparent');

    rerender(<Button intent="ghost">Ghost</Button>);
    const ghostButton = screen.getByRole('button', { name: 'Ghost' });
    expect(ghostButton).not.toHaveClass('border');
    expect(ghostButton).toHaveClass('text-fg');

    rerender(<Button intent="destructive">Destructive</Button>);
    expect(screen.getByRole('button', { name: 'Destructive' })).toHaveClass(
      'bg-destructive'
    );
  });

  it('applies size variants', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);

    expect(screen.getByRole('button', { name: 'Small' })).toHaveClass('h-8');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveClass('h-10');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button', { name: 'Large' })).toHaveClass('h-12');
  });

  it('merges custom className', () => {
    render(<Button className="mt-4">Custom class</Button>);

    expect(screen.getByRole('button', { name: 'Custom class' })).toHaveClass(
      'mt-4'
    );
  });

  it('passes HTML attributes through', () => {
    render(<Button disabled aria-label="Close dialog" />);

    const button = screen.getByRole('button', { name: 'Close dialog' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-label', 'Close dialog');
  });

  it('handles onClick', () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Submit</Button>);

    screen.getByRole('button', { name: 'Submit' }).click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
