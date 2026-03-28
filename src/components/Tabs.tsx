import { Tabs as BaseTabs } from '@base-ui-components/react/tabs';
import { cn } from '../cn';

type TabsProps = {
  value?: unknown;
  defaultValue?: unknown;
  onValueChange?: (value: unknown, eventDetails: unknown) => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * Tabbed interface built on Base UI. Compose with TabsList, TabsTrigger, and TabsContent.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="one">
 *   <TabsList><TabsTrigger value="one">Tab 1</TabsTrigger></TabsList>
 *   <TabsContent value="one">Panel 1</TabsContent>
 * </Tabs>
 * ```
 */
export function Tabs({ className, ...props }: TabsProps) {
  return <BaseTabs.Root className={className} {...props} />;
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseTabs.List
      className={cn(
        'inline-flex items-center justify-start gap-1 rounded-lg bg-muted p-1',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  value,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: unknown }) {
  return (
    <BaseTabs.Tab
      value={value}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        'text-muted-fg hover:text-fg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[selected]:bg-surface data-[selected]:text-fg data-[selected]:shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: unknown }) {
  return (
    <BaseTabs.Panel
      value={value}
      className={cn('mt-3 focus-visible:outline-none', className)}
      {...props}
    />
  );
}
