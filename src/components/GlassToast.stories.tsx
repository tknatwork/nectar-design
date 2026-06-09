import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';

import { GlassToastContainer } from './GlassToast';
import { dismiss, subscribe, toast, type ToastVariant } from './toast-store';

// GlassToastContainer takes no props — it subscribes to the imperative `toast()`
// store and renders whatever has been published. Stories therefore mount the
// container and drive it through the store (buttons for interaction, a mount
// effect for the static variant previews).

const meta = {
  title: 'Components/Feedback/GlassToast',
  component: GlassToastContainer,
} satisfies Meta<typeof GlassToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const messages: Record<ToastVariant, string> = {
  default: 'Heads up — this is a default notification.',
  success: "Message sent! I'll get back to you soon.",
  error: 'Voice transcription failed. Please try again.',
  warning: 'Your session expires in 5 minutes.',
};

// Fire one sticky (duration 0) toast per variant on mount so the docs preview is
// stable; clear the store on unmount so stories don't leak toasts into each other.
function AutoToast({ variant }: { variant: ToastVariant }) {
  useEffect(() => {
    if (variant === 'success') toast.success(messages.success, 0);
    else if (variant === 'error') toast.error(messages.error, 0);
    else if (variant === 'warning') toast.warning(messages.warning, 0);
    else toast(messages.default, 0);
    // subscribe() replays the current toasts synchronously — dismiss them all on
    // unmount so each story starts clean.
    let current: { id: string }[] = [];
    const unsub = subscribe((items) => {
      current = items;
    });
    return () => {
      unsub();
      current.forEach((t) => dismiss(t.id));
    };
  }, [variant]);

  return <GlassToastContainer />;
}

export const Default: Story = {
  render: () => (
    <div style={{ minHeight: 160 }}>
      <button
        type="button"
        onClick={() => toast('Heads up — this is a default notification.')}
        className="glass glass--floating rounded-card-lg px-4 py-2 text-sm"
      >
        Show toast
      </button>
      <GlassToastContainer />
    </div>
  ),
};

// One story per variant axis (default / success / error / warning).
export const DefaultVariant: Story = {
  render: () => <AutoToast variant="default" />,
};

export const Success: Story = {
  render: () => <AutoToast variant="success" />,
};

export const Error: Story = {
  render: () => <AutoToast variant="error" />,
};

export const Warning: Story = {
  render: () => <AutoToast variant="warning" />,
};

// Interactive playground — trigger every variant and watch enter/exit/reflow.
export const Playground: Story = {
  render: () => (
    <div style={{ minHeight: 220, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={() => toast('Heads up — this is a default notification.')}
        className="glass glass--floating rounded-card-lg px-4 py-2 text-sm"
      >
        Default
      </button>
      <button
        type="button"
        onClick={() => toast.success('Saved your changes.')}
        className="glass glass--floating rounded-card-lg px-4 py-2 text-sm"
      >
        Success
      </button>
      <button
        type="button"
        onClick={() => toast.error('Something went wrong.')}
        className="glass glass--floating rounded-card-lg px-4 py-2 text-sm"
      >
        Error
      </button>
      <button
        type="button"
        onClick={() => toast.warning('Your session expires soon.')}
        className="glass glass--floating rounded-card-lg px-4 py-2 text-sm"
      >
        Warning
      </button>
      <GlassToastContainer />
    </div>
  ),
};
