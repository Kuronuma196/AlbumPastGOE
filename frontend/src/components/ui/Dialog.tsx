import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';


export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = DialogPrimitive.Content;
export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
<div className="mb-4">{children}</div>
);
export const DialogTitle = DialogPrimitive.Title;
export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
<div className="mt-4 flex justify-end gap-2">{children}</div>
);