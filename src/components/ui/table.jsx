import React from 'react'

export function Table({ className = '', children, ...props }) {
  return <table className={['w-full text-sm', className].join(' ')} {...props}>{children}</table>
}
export function TableHeader({ className = '', children, ...props }) {
  return <thead className={className} {...props}>{children}</thead>
}
export function TableBody({ className = '', children, ...props }) {
  return <tbody className={className} {...props}>{children}</tbody>
}
export function TableRow({ className = '', children, ...props }) {
  return <tr className={['border-b last:border-0', className].join(' ')} {...props}>{children}</tr>
}
export function TableHead({ className = '', children, ...props }) {
  return <th className={['text-left font-medium p-3 bg-slate-50', className].join(' ')} {...props}>{children}</th>
}
export function TableCell({ className = '', children, ...props }) {
  return <td className={['p-3 align-middle', className].join(' ')} {...props}>{children}</td>
}
