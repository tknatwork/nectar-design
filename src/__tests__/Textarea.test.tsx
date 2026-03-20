import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Textarea } from '../components/Textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea aria-label="Message" />);

    expect(screen.getByRole('textbox', { name: 'Message' })).toBeInTheDocument();
  });

  it('uses forwardRef and exposes the expected displayName', () => {
    const ref = createRef<HTMLTextAreaElement>();

    render(<Textarea ref={ref} aria-label="Details" />);

    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Details' }));
    expect(Textarea.displayName).toBe('Textarea');
  });

  it('applies default classes', () => {
    render(<Textarea aria-label="Default textarea" />);

    const textarea = screen.getByRole('textbox', {
      name: 'Default textarea',
    });

    expect(textarea).toHaveClass('w-full');
    expect(textarea).toHaveClass('border-border');
    expect(textarea).toHaveClass('resize-y');
    expect(textarea).toHaveClass('px-4');
    expect(textarea).toHaveClass('py-3');
  });

  it('applies the error variant', () => {
    render(<Textarea variant="error" aria-label="Errored textarea" />);

    const textarea = screen.getByRole('textbox', {
      name: 'Errored textarea',
    });

    expect(textarea).toHaveClass('border-destructive');
    expect(textarea).toHaveClass('focus-visible:ring-destructive');
  });

  it('merges a custom className', () => {
    render(<Textarea className="min-h-32" aria-label="Custom textarea" />);

    expect(
      screen.getByRole('textbox', { name: 'Custom textarea' })
    ).toHaveClass('min-h-32');
  });
});
