import React from 'react';


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
label?: string;
}


export const Input: React.FC<InputProps> = ({ label, ...props }) => {
return (
<div className="flex flex-col gap-1">
{label && <label className="text-sm font-medium">{label}</label>}
<input
className="border rounded px-3 py-2 focus:outline-none focus:ring"
{...props}
/>
</div>
);
};