import React from 'react'

export function Button({ className = '', variant = 'default', size = 'md', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-1 font-medium transition rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white',
    outline: 'border border-[var(--primary-color)] text-[var(--primary-color)] bg-white hover:bg-slate-50',
    ghost: 'hover:bg-slate-100',
    link: 'text-[var(--primary-color)] underline-offset-4 hover:underline',
    secondary: 'bg-slate-100 hover:bg-slate-200'
  }
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
    icon: 'h-10 w-10 p-0'
  }
  const cls = [base, variants[variant] || variants.default, sizes[size] || sizes.md, className].join(' ')
  return <button className={cls} {...props}>{children}</button>
}
