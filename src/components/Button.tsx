import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';
import type { ButtonHTMLAttributes } from 'react';

/**
 * Button variants — cva locks token relationships per size/intent.
 *
 * Size coupling (mirrors Ant Design's controlHeight system):
 *   sm → h-8   + px-3  + text-sm  + rounded-sm
 *   md → h-10  + px-4  + text-sm  + rounded-md
 *   lg → h-12  + px-6  + text-base + rounded-lg
 *
 * Intent coupling (color identity):
 *   primary  → --primary bg + --primary-fg text
 *   accent   → --accent bg + --accent-fg text
 *   outline  → transparent bg + border + --fg text
 *   ghost    → transparent bg + --fg text (no border)
 *   destructive → --destructive bg + --destructive-fg text
 */
const buttonVariants = cva(
  // Base styles shared by all variants
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      intent: {
        primary: 'bg-primary text-primary-fg hover:bg-primary/90',
        accent: 'bg-accent text-accent-fg hover:bg-accent/90',
        outline: 'border border-border bg-transparent text-fg hover:bg-muted',
        ghost: 'text-fg hover:bg-muted',
        destructive: 'bg-destructive text-destructive-fg hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-sm',
        md: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-12 px-6 text-base rounded-lg',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

/**
 * Primary action button with intent and size variants.
 * Defaults to `type="button"` to prevent accidental form submission.
 *
 * @example
 * ```tsx
 * <Button intent="primary" size="md">Save</Button>
 * <Button intent="destructive" onClick={handleDelete}>Delete</Button>
 * <Button intent="outline" size="sm">Cancel</Button>
 * ```
 */
export function Button({ className, intent, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ intent, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
