import type { ReactNode } from 'react'

interface BadgeProps {
  color?: string
  icon?: ReactNode
  variant?: 'solid' | 'soft' | 'outline'
  size?: 'sm' | 'md'
  children: ReactNode
}

const sizes = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
}

export const Badge = ({
  color = '#a8a29e',
  icon,
  variant = 'solid',
  size = 'md',
  children,
}: BadgeProps) => {
  const baseClasses = `inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizes[size]}`

  if (variant === 'soft') {
    return (
      <span
        className={baseClasses}
        style={{
          backgroundColor: `${color}1a`,
          color,
        }}
      >
        {icon && <span>{icon}</span>}
        {children}
      </span>
    )
  }

  if (variant === 'outline') {
    return (
      <span
        className={baseClasses}
        style={{
          border: `1px solid ${color}`,
          color,
        }}
      >
        {icon && <span>{icon}</span>}
        {children}
      </span>
    )
  }

  return (
    <span className={`${baseClasses} text-white`} style={{ backgroundColor: color }}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}
