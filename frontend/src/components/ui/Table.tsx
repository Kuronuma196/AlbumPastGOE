import * as React from 'react';


export const Table = ({ children }: { children: React.ReactNode }) => (
<table className="w-full border-collapse">{children}</table>
);


export const TableHeader = ({ children }: { children: React.ReactNode }) => (
<thead className="border-b">{children}</thead>
);


export const TableBody = ({ children }: { children: React.ReactNode }) => (
<tbody>{children}</tbody>
);


export const TableRow = ({ children }: { children: React.ReactNode }) => (
<tr className="border-b">{children}</tr>
);


export const TableHead = ({ children }: { children: React.ReactNode }) => (
<th className="text-left px-2 py-2">{children}</th>
);


export const TableCell = ({ children }: { children: React.ReactNode }) => (
<td className="px-2 py-2">{children}</td>
);