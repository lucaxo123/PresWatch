import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useMonthStore, formatMonthLabel } from '../../stores/monthStore'

export const MonthSwitcher = () => {
  const selectedMonth = useMonthStore((s) => s.selectedMonth)
  const previousMonth = useMonthStore((s) => s.previousMonth)
  const nextMonth = useMonthStore((s) => s.nextMonth)
  const resetToCurrent = useMonthStore((s) => s.resetToCurrent)

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const isCurrent = selectedMonth === currentMonth

  return (
    <div className="inline-flex items-center gap-1 bg-surface-muted border border-line rounded-lg p-1">
      <button
        type="button"
        onClick={previousMonth}
        aria-label="Mes anterior"
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-content-secondary hover:text-content-primary hover:bg-surface-raised transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="px-2 min-w-[130px] text-center">
        <span className="text-sm font-medium text-content-primary tabular-nums">
          {formatMonthLabel(selectedMonth)}
        </span>
      </div>
      <button
        type="button"
        onClick={nextMonth}
        aria-label="Mes siguiente"
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-content-secondary hover:text-content-primary hover:bg-surface-raised transition-colors"
      >
        <ChevronRight size={16} />
      </button>
      {!isCurrent && (
        <button
          type="button"
          onClick={resetToCurrent}
          aria-label="Volver al mes actual"
          title="Volver al mes actual"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-content-secondary hover:text-accent hover:bg-surface-raised transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  )
}
