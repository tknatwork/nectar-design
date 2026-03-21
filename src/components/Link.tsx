import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const linkVariants = cva(
  'inline-flex items-center gap-1 underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'text-primary hover:text-primary/80 underline',
        muted: 'text-muted-fg hover:text-fg underline',
        nav: 'text-fg hover:text-primary no-underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof linkVariants> & {
    external?: boolean;
  };

/**
 * Styled anchor with variant styles and optional external link handling.
 *
 * @example
 * ```tsx
 * <Link href="/about" variant="nav">About</Link>
 * ```
 */
export function Link({ className, variant, external, children, ...props }: LinkProps) {
  return (
    <a
      className={cn(linkVariants({ variant }), className)}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {children}
      {external && <ExternalIcon />}
    </a>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M5 1H11V7M11 1L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { linkVariants };
