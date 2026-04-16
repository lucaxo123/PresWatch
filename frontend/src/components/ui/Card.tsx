import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'elevated' | 'subtle'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

const variants = {
  default: 'bg-surface-raised border border-line shadow-card',
  elevated: 'bg-surface-raised border border-line shadow-elevated',
  subtle: 'bg-surface-muted border border-line',
}

export const Card = ({
  padding = 'md',
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) => (
  <div
    className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${className}`}
    {...props}
  >
    {children}
  </div>
)
