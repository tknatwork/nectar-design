import { cn } from '../cn';

/**
 * Responsive table wrapper with horizontal scroll. Compose with TableHeader, TableBody, TableRow, TableHead, and TableCell.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
 *   <TableBody><TableRow><TableCell>Alice</TableCell></TableRow></TableBody>
 * </Table>
 * ```
 */
export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/50',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-10 px-3 text-start align-middle font-medium text-muted-fg [&:has([role=checkbox])]:pe-0',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('p-3 align-middle [&:has([role=checkbox])]:pe-0', className)}
      {...props}
    />
  );
}
