import * as React from 'react';


export interface TextareaProps
extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}


export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
({ className, ...props }, ref) => (
<textarea
ref={ref}
className={`border rounded px-3 py-2 focus:outline-none focus:ring ${className}`}
{...props}
/>
)
);
Textarea.displayName = 'Textarea';