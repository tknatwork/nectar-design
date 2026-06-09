'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { cn } from '../cn';

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement<Record<string, unknown>>;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
  className?: string;
};

/**
 * Accessible tooltip that displays content on hover/focus of its child trigger.
 *
 * @example
 * ```tsx
 * <Tooltip content="Copy to clipboard">
 *   <button>Copy</button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  delayDuration = 200,
  className,
}: TooltipProps) {
  return (
    <BaseTooltip.Provider delay={delayDuration}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={children} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} sideOffset={6}>
            <BaseTooltip.Popup
              className={cn(
                'z-50 rounded-md bg-fg px-3 py-1.5 text-xs text-bg shadow-md animate-in fade-in-0 zoom-in-95',
                className
              )}
            >
              {content}
              <BaseTooltip.Arrow className="fill-fg" />
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
