import React from 'react'

export function Card({ className = '', children, ...props }) {
  return <div className={['bg-white border rounded-2xl', className].join(' ')} {...props}>{children}</div>
}
export function CardHeader({ className = '', children, ...props }) {
  return <div className={['p-5', className].join(' ')} {...props}>{children}</div>
}
export function CardTitle({ className = '', children, ...props }) {
  return <div className={['text-base font-semibold', className].join(' ')} {...props}>{children}</div>
}
export function CardContent({ className = '', children, ...props }) {
  return <div className={['p-5', className].join(' ')} {...props}>{children}</div>
}
