import { RadioGroup as BaseRadioGroup } from '@base-ui-components/react/radio-group';
import { Radio as BaseRadio } from '@base-ui-components/react/radio';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const radioVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full border-2 border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[checked]:border-primary',
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

const indicatorVariants = cva(
  'rounded-full bg-primary',
  {
    variants: {
      size: {
        sm: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type RadioOption = { value: string; label: string; disabled?: boolean };

type RadioGroupProps = VariantProps<typeof radioVariants> & {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: unknown, eventDetails: unknown) => void;
  disabled?: boolean;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-label'?: string;
};

/**
 * Radio button group with vertical or horizontal orientation.
 *
 * @example
 * ```tsx
 * <RadioGroup options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} onValueChange={(v) => console.log(v)} />
 * ```
 */
export function RadioGroup({
  options,
  size,
  orientation = 'vertical',
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-required': ariaRequired,
  'aria-label': ariaLabel,
  ...props
}: RadioGroupProps) {
  return (
    <BaseRadioGroup
      id={id}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired}
      aria-label={ariaLabel}
      className={cn(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            'flex items-center gap-2 text-sm text-fg',
            opt.disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <BaseRadio.Root
            value={opt.value}
            disabled={opt.disabled}
            aria-label={opt.label}
            className={radioVariants({ size })}
          >
            <BaseRadio.Indicator className={indicatorVariants({ size })} />
          </BaseRadio.Root>
          {opt.label}
        </label>
      ))}
    </BaseRadioGroup>
  );
}

export { radioVariants };
