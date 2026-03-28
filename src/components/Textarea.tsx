import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

const textareaVariants = cva(
  'w-full border bg-input text-fg placeholder:text-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50 resize-y',
  {
    variants: {
      size: {
        sm: 'px-3 py-2 text-sm rounded-sm',
        md: 'px-4 py-3 text-sm rounded-md',
        lg: 'px-4 py-4 text-base rounded-lg',
      },
      variant: {
        default: 'border-border',
        error: 'border-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> &
  VariantProps<typeof textareaVariants>;

/**
 * Multi-line text input with size and error variants, forwards ref for form integration.
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Write a message..." rows={4} />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, variant, ...props }, ref) => {
    const isError = variant === 'error';
    return (
      <textarea
        ref={ref}
        {...(isError && { 'aria-invalid': 'true' })}
        className={cn(textareaVariants({ size, variant }), className)}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { textareaVariants };
