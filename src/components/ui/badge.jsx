import React from 'react'

export function Badge({ className = '', variant = 'default', children }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  const variants = {
    default: 'bg-slate-900 text-white',
    secondary: 'bg-slate-100 text-slate-900',
    outline: 'border',
    destructive: 'bg-red-600 text-white'
  }
  return <span className={[base, variants[variant] || variants.default, className].join(' ')}>{children}</span>
}
