import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Alert, AlertTitle, AlertDescription } from '../components/Alert';
import { Skeleton } from '../components/Skeleton';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../components/Dialog';

// ── Alert ──────────────────────────────────────────────────────────────────────

describe('Alert', () => {
  it('renders with role="alert"', () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something happened');
  });

  it('renders title and description', () => {
    render(
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Error');
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('applies variant classes', () => {
    const { container } = render(<Alert variant="destructive">Error</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('destructive');
  });

  it('passes axe audit — default', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>All systems operational.</AlertDescription>
      </Alert>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe audit — destructive', async () => {
    const { container } = render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Payment failed.</AlertDescription>
      </Alert>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ── Skeleton ───────────────────────────────────────────────────────────────────

describe('Skeleton', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<Skeleton className="h-10 w-40" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies variant classes — circular', () => {
    const { container } = render(<Skeleton variant="circular" className="h-10 w-10" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-full');
  });

  it('applies variant classes — text', () => {
    const { container } = render(<Skeleton variant="text" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-sm');
  });

  it('has animate-pulse class', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('animate-pulse');
  });
});

// ── Dialog ─────────────────────────────────────────────────────────────────────

describe('Dialog', () => {
  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Confirm</DialogTitle>
          <DialogDescription>Are you sure?</DialogDescription>
          <DialogClose>Cancel</DialogClose>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Confirm</DialogTitle>
          <DialogClose>Cancel</DialogClose>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Confirm')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    // Dialog should be closed — title no longer visible
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Confirm</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Confirm')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });
});
