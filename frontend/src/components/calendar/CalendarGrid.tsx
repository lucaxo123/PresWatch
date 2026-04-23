import { useMemo } from 'react'
import { DayCell } from './DayCell'
import type { CalendarData } from '../../types'

const WEEKDAYS = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D']

interface CalendarGridProps {
  month: string
  calendarData: CalendarData
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

export const CalendarGrid = ({
  month,
  calendarData,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) => {
  const today = new Date().toISOString().split('T')[0]

  const cells = useMemo(() => {
    const [year, mon] = month.split('-').map(Number)
    const firstDay = new Date(year, mon - 1, 1)
    const lastDay = new Date(year, mon, 0)
    const daysInMonth = lastDay.getDate()

    // Monday-based: getDay() returns 0=Sun, we want 0=Mon
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6

    const prevMonthLastDay = new Date(year, mon - 1, 0).getDate()

    const result: {
      day: number
      dateStr: string
      isCurrentMonth: boolean
    }[] = []

    // Previous month fill
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const prevMonth = mon - 1 <= 0 ? 12 : mon - 1
      const prevYear = mon - 1 <= 0 ? year - 1 : year
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      result.push({ day: d, dateStr, isCurrentMonth: false })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      result.push({ day: d, dateStr, isCurrentMonth: true })
    }

    // Next month fill
    const remaining = 7 - (result.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextMonth = mon + 1 > 12 ? 1 : mon + 1
        const nextYear = mon + 1 > 12 ? year + 1 : year
        const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        result.push({ day: d, dateStr, isCurrentMonth: false })
      }
    }

    return result
  }, [month])

  return (
    <div className="bg-surface-raised border border-line rounded-xl p-4 shadow-card">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-content-muted py-2"
          >
            {day}
          </div>
        ))}
        {cells.map((cell) => {
          const dayData = calendarData[cell.dateStr]
          return (
            <DayCell
              key={cell.dateStr}
              day={cell.day}
              isCurrentMonth={cell.isCurrentMonth}
              isToday={cell.dateStr === today}
              isSelected={cell.dateStr === selectedDate}
              hasExpenses={(dayData?.expenses.length ?? 0) > 0}
              hasSubscriptions={(dayData?.subscriptions.length ?? 0) > 0}
              hasDebts={(dayData?.debts?.length ?? 0) > 0}
              onClick={() => onSelectDate(cell.dateStr)}
            />
          )
        })}
      </div>
    </div>
  )
}
