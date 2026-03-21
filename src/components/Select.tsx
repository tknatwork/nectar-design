import { Select as BaseSelect } from '@base-ui-components/react/select';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const triggerVariants = cva(
  'inline-flex items-center justify-between w-full border bg-input text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm rounded-sm',
        md: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-12 px-4 text-base rounded-lg',
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

type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = VariantProps<typeof triggerVariants> & {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null, eventDetails: unknown) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
};

/**
 * Dropdown select built on Base UI with size and error variants.
 *
 * @example
 * ```tsx
 * <Select options={[{ value: "a", label: "Option A" }]} onValueChange={(v) => console.log(v)} />
 * ```
 */
export function Select({
  options,
  placeholder = 'Select…',
  size,
  variant,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-required': ariaRequired,
  ...props
}: SelectProps) {
  return (
    <BaseSelect.Root {...props}>
      <BaseSelect.Trigger
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-required={ariaRequired}
        className={cn(triggerVariants({ size, variant }), className)}
      >
        <BaseSelect.Value>{(value) => value ?? placeholder}</BaseSelect.Value>
        <BaseSelect.Icon className="ms-2 text-muted-fg">
          <ChevronIcon />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4}>
          <BaseSelect.Popup className="z-50 min-w-[var(--anchor-width)] overflow-hidden rounded-md border border-border bg-surface p-1 shadow-md">
            {options.map((opt) => (
              <BaseSelect.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-1.5 text-sm text-surface-fg outline-none data-[highlighted]:bg-muted data-[highlighted]:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                <BaseSelect.ItemIndicator className="ms-auto">
                  <CheckIcon />
                </BaseSelect.ItemIndicator>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { triggerVariants as selectTriggerVariants };
