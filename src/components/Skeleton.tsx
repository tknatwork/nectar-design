import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const skeletonVariants = cva(
  'animate-pulse bg-muted',
  {
    variants: {
      variant: {
        default: 'rounded-md',
        circular: 'rounded-full',
        text: 'rounded-sm h-4 w-3/4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants>;

/**
 * Animated placeholder for loading states with rectangular, circular, or text shapes.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" className="w-48" />
 * ```
 */
export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { skeletonVariants };
