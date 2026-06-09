import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const containerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      sm: 'max-w-container-sm',
      md: 'max-w-container-md',
      lg: 'max-w-container-lg',
      xl: 'max-w-container-xl',
      full: 'max-w-full',
    },
    padding: {
      none: '',
      responsive: 'px-md tablet:px-lg tablet-landscape:px-xl',
      fixed: 'px-md',
    },
  },
  defaultVariants: {
    size: 'lg',
    padding: 'responsive',
  },
});

type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants> & {
    dir?: 'ltr' | 'rtl';
  };

/**
 * Centered max-width container for page-level content layout.
 * Uses token-based container widths and responsive padding.
 *
 * @example
 * ```tsx
 * <Container size="lg">Page content</Container>
 * <Container size="xl" padding="none">Full-bleed hero</Container>
 * ```
 */
export function Container({ className, size, padding, dir, ...props }: ContainerProps) {
  return (
    <div
      dir={dir}
      className={cn(containerVariants({ size, padding }), className)}
      {...props}
    />
  );
}

export { containerVariants };
