import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const dividerVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px self-stretch',
    },
    spacing: {
      none: '',
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    { orientation: 'horizontal', spacing: 'sm', className: 'my-2' },
    { orientation: 'horizontal', spacing: 'md', className: 'my-4' },
    { orientation: 'horizontal', spacing: 'lg', className: 'my-6' },
    { orientation: 'vertical', spacing: 'sm', className: 'mx-2' },
    { orientation: 'vertical', spacing: 'md', className: 'mx-4' },
    { orientation: 'vertical', spacing: 'lg', className: 'mx-6' },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    spacing: 'md',
  },
});

type DividerProps = React.HTMLAttributes<HTMLHRElement> &
  VariantProps<typeof dividerVariants>;

/**
 * Visual separator line, horizontal or vertical, with configurable spacing.
 *
 * @example
 * ```tsx
 * <Divider orientation="horizontal" spacing="md" />
 * ```
 */
export function Divider({ className, orientation, spacing, ...props }: DividerProps) {
  return (
    <hr
      role="separator"
      aria-orientation={orientation ?? 'horizontal'}
      className={cn(dividerVariants({ orientation, spacing }), className)}
      {...props}
    />
  );
}

export { dividerVariants };
