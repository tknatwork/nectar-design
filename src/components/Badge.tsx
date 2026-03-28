import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';
import type { HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      intent: {
        default: 'bg-muted text-muted-fg',
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        destructive: 'bg-destructive/10 text-destructive',
      },
      size: {
        sm: 'h-5 px-1.5 text-xs rounded-sm',
        md: 'h-6 px-2.5 text-xs rounded-md',
        lg: 'h-7 px-3 text-sm rounded-md',
      },
    },
    defaultVariants: {
      intent: 'default',
      size: 'md',
    },
  }
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

/**
 * Inline status label with intent-based color variants.
 *
 * @example
 * ```tsx
 * <Badge intent="success" size="sm">Active</Badge>
 * ```
 */
export function Badge({ className, intent, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ intent, size }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
