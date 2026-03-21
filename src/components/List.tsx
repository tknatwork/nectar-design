import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const listVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'gap-0',
      spaced: 'gap-1',
      divided: 'gap-0 divide-y divide-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ListProps = React.HTMLAttributes<HTMLUListElement> &
  VariantProps<typeof listVariants> & {
    ordered?: boolean;
  };

/**
 * Vertical list container with optional dividers, supporting ordered and unordered modes.
 *
 * @example
 * ```tsx
 * <List variant="divided">
 *   <ListItem>Item one</ListItem>
 *   <ListItem>Item two</ListItem>
 * </List>
 * ```
 */
export function List({ className, variant, ordered, ...props }: ListProps) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={cn(listVariants({ variant }), className)} {...props} />
  );
}

const listItemVariants = cva('flex items-center text-sm text-fg', {
  variants: {
    size: {
      sm: 'px-2 py-1.5',
      md: 'px-3 py-2',
      lg: 'px-4 py-3',
    },
    interactive: {
      true: 'cursor-pointer transition-colors hover:bg-muted rounded-md',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    interactive: false,
  },
});

type ListItemProps = React.LiHTMLAttributes<HTMLLIElement> &
  VariantProps<typeof listItemVariants>;

export function ListItem({ className, size, interactive, ...props }: ListItemProps) {
  return (
    <li
      className={cn(listItemVariants({ size, interactive }), className)}
      {...props}
    />
  );
}

export { listVariants, listItemVariants };
