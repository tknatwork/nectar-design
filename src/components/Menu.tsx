import { Menu as BaseMenu } from '@base-ui-components/react/menu';
import { cn } from '../cn';

type MenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: unknown) => void;
  children: React.ReactNode;
};

/**
 * Dropdown menu built on Base UI. Compose with MenuTrigger, MenuContent, and MenuItem.
 *
 * @example
 * ```tsx
 * <Menu>
 *   <MenuTrigger>Actions</MenuTrigger>
 *   <MenuContent><MenuItem>Edit</MenuItem><MenuItem>Delete</MenuItem></MenuContent>
 * </Menu>
 * ```
 */
export function Menu({ children, ...props }: MenuProps) {
  return <BaseMenu.Root {...props}>{children}</BaseMenu.Root>;
}

export function MenuTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger>) {
  return <BaseMenu.Trigger className={className} {...props} />;
}

export function MenuContent({
  className,
  side = 'bottom',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} sideOffset={4}>
        <BaseMenu.Popup
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 shadow-lg',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
            'transition-all',
            className
          )}
          {...props}
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Item>) {
  return (
    <BaseMenu.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-surface-fg outline-none transition-colors',
        'data-[highlighted]:bg-muted data-[highlighted]:text-fg',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function MenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseMenu.Separator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}
