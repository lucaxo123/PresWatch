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
    <div className="bg-surface-raised border border-line rounded-xl p-4 shadow-card flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-content-muted truncate">
          {label}
        </span>
        {icon && <span className="text-content-muted shrink-0">{icon}</span>}
      </div>
      <div className={`text-2xl font-semibold tabular-nums truncate ${toneMap[tone]}`}>
        {value}
      </div>
      {hint && <span className="text-xs text-content-muted truncate">{hint}</span>}
    </div>
  )
}
