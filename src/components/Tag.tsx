import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const tagVariants = cva(
  'inline-flex items-center gap-1 rounded-full border text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-surface-fg',
        primary: 'border-primary/30 bg-primary/10 text-primary',
        accent: 'border-accent/30 bg-accent/10 text-accent',
        muted: 'border-border bg-muted text-muted-fg',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-0.5',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type TagProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof tagVariants> & {
    onRemove?: () => void;
  };

/**
 * Pill-shaped tag with optional remove button for categorization and filtering.
 *
 * @example
 * ```tsx
 * <Tag variant="primary" onRemove={() => console.log("removed")}>React</Tag>
 * ```
 */
export function Tag({ className, variant, size, children, onRemove, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant, size }), className)} {...props}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="ms-0.5 rounded-full p-0.5 hover:bg-fg/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}

export { tagVariants };
