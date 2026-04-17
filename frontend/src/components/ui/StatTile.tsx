import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'accent' | 'danger' | 'success'
}

const toneMap = {
  default: 'text-content-primary',
  accent: 'text-accent',
  danger: 'text-danger',
  success: 'text-success',
} as const

export const StatTile = ({ label, value, hint, icon, tone = 'default' }: StatTileProps) => {
  return (
    <div className="bg-surface-raised border border-line rounded-xl p-4 shadow-card flex flex-col gap-1.5 min-w-0 relative">
      {icon && <span className="text-content-muted absolute top-4 right-4">{icon}</span>}
      <p className="text-xs font-medium uppercase tracking-wide text-content-muted leading-snug pr-6">
        {label}
      </p>
      <div className={`text-2xl font-semibold tabular-nums break-words ${toneMap[tone]}`}>
        {value}
      </div>
      {hint && <span className="text-xs text-content-muted">{hint}</span>}
    </div>
  )
}
