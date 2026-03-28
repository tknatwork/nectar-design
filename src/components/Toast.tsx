import { Toast as BaseToast } from '@base-ui-components/react/toast';
import { cva } from 'class-variance-authority';
import { cn } from '../cn';

// ── Toast variants ─────────────────────────────────────────────────────────────

const toastVariants = cva(
  'relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-surface text-surface-fg border-border',
        destructive: 'bg-destructive/10 text-destructive border-destructive/30',
        success: 'bg-success/10 text-success border-success/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ── Singleton toast manager ────────────────────────────────────────────────────

export const toastManager = BaseToast.createToastManager();

// ── Toast Viewport (mount once in layout) ──────────────────────────────────────

type ToastData = {
  variant?: 'default' | 'destructive' | 'success';
};

function ToastItem({ toast }: { toast: BaseToast.Root.Props['toast'] }) {
  const data = (toast as unknown as { data?: ToastData }).data;
  return (
    <BaseToast.Root
      toast={toast}
      className={cn(
        toastVariants({ variant: data?.variant }),
        'data-[starting-style]:opacity-0 data-[starting-style]:translate-y-2',
        'data-[ending-style]:opacity-0 data-[ending-style]:translate-y-2',
        'transition-all'
      )}
    >
      <div className="flex-1">
        {toast.title && (
          <BaseToast.Title className="text-sm font-semibold">
            {toast.title}
          </BaseToast.Title>
        )}
        {toast.description && (
          <BaseToast.Description className="text-sm opacity-80 mt-1">
            {toast.description}
          </BaseToast.Description>
        )}
      </div>
      <BaseToast.Close
        className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Dismiss"
      >
        <CloseIcon />
      </BaseToast.Close>
    </BaseToast.Root>
  );
}

/**
 * Toast viewport provider -- mount once at the app root to enable toast notifications.
 *
 * @example
 * ```tsx
 * <ToastProvider><App /></ToastProvider>
 * ```
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseToast.Provider toastManager={toastManager}>
      {children}
      <BaseToast.Viewport className="fixed bottom-4 end-4 z-[100] flex max-w-sm flex-col gap-2" />
    </BaseToast.Provider>
  );
}

// ── Imperative toast API ───────────────────────────────────────────────────────

/**
 * Imperative function to show a toast notification from anywhere in the app.
 *
 * @example
 * ```tsx
 * toast({ title: "Saved", variant: "success" })
 * ```
 */
export function toast(options: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
  timeout?: number;
}) {
  const { variant, ...rest } = options;
  return toastManager.add({
    ...rest,
    data: { variant },
  });
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export { toastVariants, ToastItem };
