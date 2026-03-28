import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const alertVariants = cva(
  'relative w-full rounded-md border p-4 text-sm [&>svg]:absolute [&>svg]:start-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:ps-11',
  {
    variants: {
      variant: {
        default: 'bg-surface text-surface-fg border-border',
        destructive: 'bg-destructive/10 text-destructive border-destructive/30',
        success: 'bg-success/10 text-success border-success/30',
        warning: 'bg-warning/10 text-fg border-warning/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

/**
 * Contextual alert banner with semantic color variants for feedback messages.
 *
 * @example
 * ```tsx
 * <Alert variant="success">
 *   <AlertTitle>Saved</AlertTitle>
 *   <AlertDescription>Your changes have been saved.</AlertDescription>
 * </Alert>
 * ```
 */
export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}

export { alertVariants };
