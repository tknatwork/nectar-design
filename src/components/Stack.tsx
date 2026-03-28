import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const stackVariants = cva('flex', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    responsive: {
      none: '',
      tablet: 'tablet:flex-row',
      desktop: 'desktop:flex-row',
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
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    responsive: 'none',
    gap: 'md',
    align: 'stretch',
    wrap: false,
  },
});

type StackProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof stackVariants> & {
    dir?: 'ltr' | 'rtl';
  };

/**
 * Flexbox layout primitive for vertical or horizontal stacking with configurable gap and alignment.
 *
 * @example
 * ```tsx
 * <Stack direction="horizontal" gap="md" align="center">
 *   <span>A</span><span>B</span>
 * </Stack>
 * <Stack direction="vertical" responsive="tablet" gap="lg">
 *   <Card /><Card />
 * </Stack>
 * ```
 */
export function Stack({
  className,
  direction,
  responsive,
  gap,
  align,
  justify,
  wrap,
  dir,
  ...props
}: StackProps) {
  return (
    <div
      dir={dir}
      className={cn(stackVariants({ direction, responsive, gap, align, justify, wrap }), className)}
      {...props}
    />
  );
}

export { stackVariants };
