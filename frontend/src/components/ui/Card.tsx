import React from 'react';


interface CardProps {
children: React.ReactNode;
}


export const Card: React.FC<CardProps> = ({ children }) => {
return (
<div className="bg-white rounded-lg shadow p-4">
{children}
</div>
);
};