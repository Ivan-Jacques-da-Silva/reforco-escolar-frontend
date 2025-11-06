import React from 'react'

export function Label({ className = '', children, ...props }) {
  return <label className={['text-sm font-medium', className].join(' ')} {...props}>{children}</label>
}
