import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';
import { useState } from 'react';

const avatarVariants = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-fg font-medium',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type AvatarProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof avatarVariants> & {
    src?: string;
    alt?: string;
    fallback?: string;
  };

/**
 * User avatar displaying an image with automatic initial-based fallback on error.
 *
 * @example
 * ```tsx
 * <Avatar src="/photo.jpg" alt="Jane Doe" size="lg" />
 * ```
 */
export function Avatar({ className, size, src, alt = '', fallback, ...props }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const initials = fallback ?? alt.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}

export { avatarVariants };
