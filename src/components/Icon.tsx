import { Icon as IconifyIcon } from '@iconify/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const iconVariants = cva('inline-block shrink-0', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-6',
      xl: 'size-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type IconProps = VariantProps<typeof iconVariants> & {
  /** Iconify icon identifier (e.g. "ph:house-duotone", "lucide:search") */
  icon: string;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label — when provided, icon becomes semantic (aria-hidden removed) */
  'aria-label'?: string;
};

/**
 * Token-aware icon wrapper around Iconify.
 * Inherits text color via currentColor — use `text-primary`, `text-fg`, etc.
 *
 * @example
 * ```tsx
 * // Decorative (default — aria-hidden)
 * <Icon icon="ph:house-duotone" size="lg" />
 *
 * // Semantic (accessible)
 * <Icon icon="ph:magnifying-glass" aria-label="Search" />
 *
 * // Any icon set works
 * <Icon icon="lucide:settings" className="text-muted-fg" />
 * ```
 */
export function Icon({ icon, size, className, 'aria-label': ariaLabel, ...props }: IconProps) {
  const isDecorative = !ariaLabel;

  return (
    <IconifyIcon
      icon={icon}
      className={cn(iconVariants({ size }), className)}
      aria-hidden={isDecorative ? 'true' : undefined}
      aria-label={ariaLabel}
      role={isDecorative ? undefined : 'img'}
      {...props}
    />
  );
}

export { iconVariants };
