import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Label } from '../components/Label';

describe('axe accessibility', () => {
  it('Button has no violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label has no violations', async () => {
    const { container } = render(
      <>
        <Label htmlFor="test-input">Name</Label>
        <Input id="test-input" />
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input error variant sets aria-invalid', () => {
    render(<Input variant="error" aria-label="Email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('Textarea with Label has no violations', async () => {
    const { container } = render(
      <>
        <Label htmlFor="test-textarea">Message</Label>
        <Textarea id="test-textarea" />
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Textarea error variant sets aria-invalid', () => {
    render(<Textarea variant="error" aria-label="Bio" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('Card has no violations', async () => {
    const { container } = render(<Card>Content</Card>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge has no violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Label with required shows asterisk', () => {
    render(<Label required>Email</Label>);
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Button defaults', () => {
  it('has type="button" by default', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('allows type="submit" override', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});

describe('Card interactive variant', () => {
  it('has role="button" and tabIndex when interactive', () => {
    render(<Card variant="interactive">Click card</Card>);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('does not have role="button" when default', () => {
    render(<Card>Static card</Card>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('keyboard navigation', () => {
  it('Tab moves focus through form elements', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
        <Label htmlFor="msg">Message</Label>
        <Textarea id="msg" />
        <Button>Submit</Button>
      </>
    );

    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('Enter/Space on Button triggers onClick', async () => {
    const user = userEvent.setup();
    let clicked = 0;
    render(<Button onClick={() => clicked++}>Act</Button>);

    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(clicked).toBe(1);

    await user.keyboard(' ');
    expect(clicked).toBe(2);
  });
});
