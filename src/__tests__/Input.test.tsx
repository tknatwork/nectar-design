import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from '../components/Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input aria-label="Name" />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  it('uses forwardRef and exposes the expected displayName', () => {
    const ref = createRef<HTMLInputElement>();

    render(<Input ref={ref} aria-label="Email" />);

    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Email' }));
    expect(Input.displayName).toBe('Input');
  });

  it('applies default classes', () => {
    render(<Input aria-label="Default input" />);

    const input = screen.getByRole('textbox', { name: 'Default input' });

    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('border-border');
    expect(input).toHaveClass('h-10');
  });

  it('applies size variants', () => {
    const { rerender } = render(<Input size="sm" aria-label="Small input" />);

    expect(screen.getByRole('textbox', { name: 'Small input' })).toHaveClass(
      'h-8'
    );

    rerender(<Input size="md" aria-label="Medium input" />);
    expect(screen.getByRole('textbox', { name: 'Medium input' })).toHaveClass(
      'h-10'
    );

    rerender(<Input size="lg" aria-label="Large input" />);
    expect(screen.getByRole('textbox', { name: 'Large input' })).toHaveClass(
      'h-12'
    );
  });

  it('applies the error variant', () => {
    render(<Input variant="error" aria-label="Errored input" />);

    const input = screen.getByRole('textbox', { name: 'Errored input' });

    expect(input).toHaveClass('border-destructive');
    expect(input).toHaveClass('focus-visible:ring-destructive');
  });

  it('merges a custom className', () => {
    render(<Input className="mt-4" aria-label="Custom input" />);

    expect(screen.getByRole('textbox', { name: 'Custom input' })).toHaveClass(
      'mt-4'
    );
  });

  it('passes HTML attributes through', () => {
    render(
      <Input
        aria-label="Password"
        disabled
        placeholder="Enter password"
        type="password"
      />
    );

    const input = screen.getByLabelText('Password');

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('placeholder', 'Enter password');
    expect(input).toHaveAttribute('type', 'password');
  });
});
