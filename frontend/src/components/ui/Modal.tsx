import React from 'react';


interface ModalProps {
isOpen: boolean;
title?: string;
onClose: () => void;
children: React.ReactNode;
}


export const Modal: React.FC<ModalProps> = ({
isOpen,
title,
onClose,
children,
}) => {
if (!isOpen) return null;


return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
<div className="bg-white rounded-lg p-6 w-full max-w-md">
{title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
{children}
<div className="mt-4 flex justify-end">
<button onClick={onClose} className="text-sm text-gray-500">
Fechar
</button>
</div>
</div>
</div>
);
};