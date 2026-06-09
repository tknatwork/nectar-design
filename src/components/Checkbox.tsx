'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const checkboxVariants = cva(
  'inline-flex shrink-0 items-center justify-center border-2 border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[checked]:bg-primary data-[checked]:border-primary data-[checked]:text-primary-fg',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 rounded-sm',
        md: 'h-5 w-5 rounded',
        lg: 'h-6 w-6 rounded',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type CheckboxProps = VariantProps<typeof checkboxVariants> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-label'?: string;
};

/**
 * Accessible checkbox with checked, unchecked, and indeterminate states.
 *
 * @example
 * ```tsx
 * <Checkbox aria-label="Accept terms" onCheckedChange={(checked) => console.log(checked)} />
 * ```
 */
export function Checkbox({
  size,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-required': ariaRequired,
  'aria-label': ariaLabel,
  ...props
}: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      id={id}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired}
      aria-label={ariaLabel}
      className={cn(checkboxVariants({ size }), className)}
      {...props}
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center text-current">
        {props.indeterminate ? <MinusIcon /> : <CheckIcon />}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 6H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export { checkboxVariants };
