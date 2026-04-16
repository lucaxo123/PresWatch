import { Select } from '../ui/Select'
import type { Category, ExpenseFilters } from '../../types'

interface ExpenseFiltersProps {
  filters: ExpenseFilters
  categories: Category[]
  onChange: (filters: ExpenseFilters) => void
  showWeek?: boolean
}

const getWeeksInMonth = (month: string): { label: string; value: string }[] => {
  const [year, m] = month.split('-').map(Number)
  const firstDay = new Date(year, m - 1, 1)
  const lastDay = new Date(year, m, 0)
  const weeks: { label: string; value: string }[] = []

  const getISOWeek = (d: Date) => {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
    const week1 = new Date(date.getFullYear(), 0, 4)
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
      )
    )
  }

  const seen = new Set<number>()
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 7)) {
    const w = getISOWeek(d)
    if (!seen.has(w)) {
      seen.add(w)
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      const fmt = (dt: Date) => `${dt.getDate()}/${dt.getMonth() + 1}`
      weeks.push({
        label: `Semana ${w} (${fmt(monday)}–${fmt(sunday)})`,
        value: `${year}-W${String(w).padStart(2, '0')}`,
      })
    }
  }
  return weeks
}

export const ExpenseFiltersBar = ({
  filters,
  categories,
  onChange,
  showWeek = true,
}: ExpenseFiltersProps) => {
  const weeks = filters.month ? getWeeksInMonth(filters.month) : []

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={filters.categoryId ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            categoryId: e.target.value ? Number(e.target.value) : null,
            week: undefined,
          })
        }
        className="min-w-[160px]"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.name}
          </option>
        ))}
      </Select>

      {showWeek && (
        <Select
          value={filters.week ?? ''}
          onChange={(e) => onChange({ ...filters, week: e.target.value || undefined })}
          className="min-w-[180px]"
        >
          <option value="">Todo el mes</option>
          {weeks.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </Select>
      )}
    </div>
  )
}
