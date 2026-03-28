import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const headingVariants = cva('font-display tracking-tight text-fg', {
  variants: {
    level: {
      1: 'text-4xl font-bold leading-tight',
      2: 'text-3xl font-semibold leading-tight',
      3: 'text-2xl font-semibold leading-snug',
      4: 'text-xl font-medium leading-snug',
      5: 'text-lg font-medium leading-normal',
      6: 'text-base font-medium leading-normal',
    },
  },
  defaultVariants: {
    level: 2,
  },
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  };

/**
 * Semantic heading (h1-h6) with typographic scale based on level.
 *
 * @example
 * ```tsx
 * <Heading level={1}>Page Title</Heading>
 * ```
 */
export function Heading({ className, level, as, ...props }: HeadingProps) {
  const Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = as ?? (`h${level ?? 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  return (
    <Tag
      className={cn(headingVariants({ level }), className)}
      {...props}
    />
  );
}

export { headingVariants };
