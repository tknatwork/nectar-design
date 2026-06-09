import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    responsive: {
      none: '',
      tablet: 'grid-cols-1 tablet:grid-cols-2',
      desktop: 'grid-cols-1 tablet:grid-cols-2 tablet-landscape:grid-cols-3',
      wide: 'grid-cols-1 tablet:grid-cols-2 tablet-landscape:grid-cols-3 desktop:grid-cols-4',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-xs',
      sm: 'gap-sm',
      md: 'gap-md',
      lg: 'gap-lg',
      xl: 'gap-xl',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
  },
  defaultVariants: {
    cols: 1,
    responsive: 'none',
    gap: 'md',
    align: 'stretch',
  },
});

type GridProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof gridVariants> & {
    dir?: 'ltr' | 'rtl';
  };

/**
 * CSS Grid layout primitive with responsive column presets.
 *
 * @example
 * ```tsx
 * <Grid cols={3} gap="lg">...</Grid>
 * <Grid responsive="desktop" gap="md">...</Grid>
 * ```
 */
export function Grid({ className, cols, responsive, gap, align, dir, ...props }: GridProps) {
  return (
    <div
      dir={dir}
      className={cn(gridVariants({ cols, responsive, gap, align }), className)}
      {...props}
    />
  );
}

export { gridVariants };
