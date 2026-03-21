import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';
import type { LabelHTMLAttributes } from 'react';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-fg',
        error: 'text-destructive',
        disabled: 'text-muted-fg opacity-70 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> &
  VariantProps<typeof labelVariants> & {
    required?: boolean;
  };

/**
 * Form label with optional required indicator and error/disabled variants.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>Email address</Label>
 * ```
 */
export function Label({ className, variant, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(labelVariants({ variant }), className)}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ms-1 text-destructive">
          *
        </span>
      )}
    </label>
  );
}

export { labelVariants };
