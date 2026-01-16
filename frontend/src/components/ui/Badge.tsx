import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';


const badgeVariants = cva(
'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition',
{
variants: {
variant: {
default: 'bg-blue-600 text-white',
secondary: 'bg-gray-200 text-gray-800',
outline: 'border border-gray-300 text-gray-800',
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


export function Badge({ className, variant, ...props }: BadgeProps) {
return (
<div className={badgeVariants({ variant, className })} {...props} />
);
}