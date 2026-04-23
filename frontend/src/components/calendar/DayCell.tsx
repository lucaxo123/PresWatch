interface DayCellProps {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  hasExpenses: boolean
  hasSubscriptions: boolean
  hasDebts: boolean
  onClick: () => void
}

export const DayCell = ({
  day,
  isCurrentMonth,
  isToday,
  isSelected,
  hasExpenses,
  hasSubscriptions,
  hasDebts,
  onClick,
}: DayCellProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-1
        w-full aspect-square rounded-xl text-sm font-medium transition-all
        ${!isCurrentMonth ? 'text-content-muted/40' : ''}
        ${isCurrentMonth && !isSelected ? 'text-content-primary hover:bg-surface-muted' : ''}
        ${isSelected ? 'bg-accent text-accent-contrast shadow-card' : ''}
        ${isToday && !isSelected ? 'ring-2 ring-accent/30' : ''}
      `}
    >
      <span>{day}</span>
      {(hasExpenses || hasSubscriptions || hasDebts) && (
        <div className="flex items-center gap-1">
          {hasExpenses && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSelected ? 'bg-accent-contrast/70' : 'bg-accent'
              }`}
            />
          )}
          {hasSubscriptions && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSelected ? 'bg-accent-contrast/70' : 'bg-success'
              }`}
            />
          )}
          {hasDebts && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSelected ? 'bg-accent-contrast/70' : 'bg-warning'
              }`}
            />
          )}
        </div>
      )}
    </button>
  )
}
