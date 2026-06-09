'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { cn } from '../cn';

type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: unknown) => void;
  children: React.ReactNode;
};

/**
 * Floating popover panel anchored to a trigger element. Compose with PopoverTrigger, PopoverContent, and PopoverTitle.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger>Info</PopoverTrigger>
 *   <PopoverContent><PopoverTitle>Details</PopoverTitle></PopoverContent>
 * </Popover>
 * ```
 */
export function Popover({ children, ...props }: PopoverProps) {
  return <BasePopover.Root {...props}>{children}</BasePopover.Root>;
}

export function PopoverTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BasePopover.Trigger>) {
  return <BasePopover.Trigger className={className} {...props} />;
}

export function PopoverContent({
  className,
  children,
  side = 'bottom',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} sideOffset={6}>
        <BasePopover.Popup
          className={cn(
            'z-50 w-72 rounded-lg border border-border bg-surface p-4 shadow-lg',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
            'transition-all',
            className
          )}
          {...props}
        >
          {children}
          <BasePopover.Arrow className="fill-surface stroke-border" />
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export function PopoverTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BasePopover.Title>) {
  return (
    <BasePopover.Title
      className={cn('text-sm font-medium text-fg', className)}
      {...props}
    />
  );
}

export function PopoverDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BasePopover.Description>) {
  return (
    <BasePopover.Description
      className={cn('text-sm text-muted-fg mt-1', className)}
      {...props}
    />
  );
}

export function PopoverClose({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BasePopover.Close>) {
  return (
    <BasePopover.Close
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    />
  );
}
