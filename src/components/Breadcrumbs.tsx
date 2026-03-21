import { cn } from '../cn';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
};

/**
 * Navigation breadcrumb trail with customizable separator and active page indication.
 *
 * @example
 * ```tsx
 * <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Settings" }]} />
 * ```
 */
export function Breadcrumbs({
  items,
  separator = <ChevronSeparator />,
  className,
}: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-sm text-muted-fg">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-border">
                  {separator}
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(isLast && 'text-fg font-medium')}
                  {...(isLast && { 'aria-current': 'page' as const })}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="transition-colors hover:text-fg"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ChevronSeparator() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
