import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const switchVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[checked]:bg-primary data-[unchecked]:bg-muted',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-[52px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-bg shadow-sm transition-transform data-[checked]:translate-x-full data-[unchecked]:translate-x-0',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type SwitchProps = VariantProps<typeof switchVariants> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-label'?: string;
};

/**
 * Toggle switch for boolean on/off settings.
 *
 * @example
 * ```tsx
 * <Switch aria-label="Dark mode" onCheckedChange={(on) => setDark(on)} />
 * ```
 */
export function Switch({
  size,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-required': ariaRequired,
  'aria-label': ariaLabel,
  ...props
}: SwitchProps) {
  return (
    <BaseSwitch.Root
      id={id}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired}
      aria-label={ariaLabel}
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <BaseSwitch.Thumb className={thumbVariants({ size })} />
    </BaseSwitch.Root>
  );
}

export { switchVariants };
