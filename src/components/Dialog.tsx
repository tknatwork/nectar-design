'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cn } from '../cn';

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: unknown) => void;
  children: React.ReactNode;
};

/**
 * Modal dialog with backdrop, built on Base UI. Compose with DialogTrigger, DialogContent, DialogTitle, and DialogDescription.
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>Open</DialogTrigger>
 *   <DialogContent><DialogTitle>Confirm</DialogTitle></DialogContent>
 * </Dialog>
 * ```
 */
export function Dialog({ children, ...props }: DialogProps) {
  return <BaseDialog.Root {...props}>{children}</BaseDialog.Root>;
}

export function DialogTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Trigger>) {
  return <BaseDialog.Trigger className={className} {...props} />;
}

export function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className="fixed inset-0 z-50 bg-fg/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity"
      />
      <BaseDialog.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 shadow-lg',
          'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
          'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
          'transition-all',
          className
        )}
        {...props}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn('text-lg font-semibold leading-none tracking-tight text-fg', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn('text-sm text-muted-fg mt-2', className)}
      {...props}
    />
  );
}

export function DialogClose({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Close>) {
  return (
    <BaseDialog.Close
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    />
  );
}
