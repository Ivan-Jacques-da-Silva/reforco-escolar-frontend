import React from 'react'

export function Input({ className = '', ...props }) {
  const base = 'h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-sky-300'
  return <input className={[base, className].join(' ')} {...props} />
}
