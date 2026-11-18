import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-sanad-emerald text-white shadow hover:bg-sanad-emerald-deep',
        secondary:
          'border-sanad-border bg-sanad-ivory-warm text-sanad-charcoal hover:bg-sanad-border',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-sanad-charcoal border-sanad-border',
        gold: 'border-sanad-gold bg-sanad-gold-subtle text-sanad-gold-dark font-extrabold uppercase tracking-wider',
        sahih: 'border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold',
        hasan: 'border-amber-600 bg-amber-50 text-amber-800 font-extrabold',
        daif: 'border-rose-400 bg-rose-50 text-rose-800 font-extrabold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

