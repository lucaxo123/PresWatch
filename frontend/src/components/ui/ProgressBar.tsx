interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'default' | 'danger' | 'warning'
  className?: string
}

export const ProgressBar = ({ value, max = 100, variant = 'default', className = '' }: ProgressBarProps) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  const barClass =
    variant === 'danger'
      ? 'bg-danger'
      : variant === 'warning'
      ? 'bg-warning'
      : 'bg-accent'

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`h-2.5 w-full rounded-full bg-surface-muted overflow-hidden ${className}`}
    >
      <div
        className={`h-full ${barClass} rounded-full transition-[width] duration-500 ease-out-soft`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
