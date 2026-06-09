'use client';

import { useId, type ReactNode, cloneElement, isValidElement, type ReactElement } from 'react';
import { cn } from '../cn';
import { Label } from './Label';

type FormFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  children: ReactElement;
  className?: string;
};

/**
 * Composable form field that wires label, error, and hint to a child input via auto-generated IDs.
 *
 * @example
 * ```tsx
 * <FormField label="Username" error="Required" required>
 *   <Input />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  error,
  hint,
  required,
  disabled,
  children,
  className,
}: FormFieldProps) {
  const id = useId();
  const inputId = `field-${id}`;
  const errorId = error ? `field-${id}-error` : undefined;
  const hintId = hint ? `field-${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: inputId,
        'aria-describedby': describedBy,
        'aria-required': required || undefined,
        disabled,
      })
    : children;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label
        htmlFor={inputId}
        required={required}
        variant={error ? 'error' : disabled ? 'disabled' : 'default'}
      >
        {label}
      </Label>
      {child}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-fg">
          {hint}
        </p>
      )}
    </div>
  );
}
