import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { DayDetailPanel } from '../components/calendar/DayDetailPanel'
import { SubscriptionList } from '../components/calendar/SubscriptionList'
import { StatTile } from '../components/ui/StatTile'
import { useCalendarData } from '../hooks/useCalendar'
import { useSubscriptionTotal } from '../hooks/useSubscriptions'
import { useMonthStore } from '../stores/monthStore'

const formatAmount = (amount: number): string =>
  `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

export const CalendarPage = () => {
  const month = useMonthStore((s) => s.selectedMonth)
  const { data: calendarData = {}, isLoading } = useCalendarData(month)
  const { data: totalSubscriptions = 0 } = useSubscriptionTotal()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const handleSelectDate = (date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile
          label="Total suscripciones"
          value={formatAmount(totalSubscriptions)}
          hint="Gasto fijo mensual"
          icon={<RefreshCw size={16} />}
          tone="accent"
        />
      </div>

      {isLoading ? (
        <div className="bg-surface-raised border border-line rounded-xl p-8 shadow-card text-center text-content-muted text-sm">
          Cargando calendario...
        </div>
      ) : (
        <CalendarGrid
          month={month}
          calendarData={calendarData}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
      )}

      {selectedDate && (
        <DayDetailPanel
          date={selectedDate}
          data={calendarData[selectedDate]}
          onClose={() => setSelectedDate(null)}
        />
      )}

      <SubscriptionList />
    </div>
  )
}
