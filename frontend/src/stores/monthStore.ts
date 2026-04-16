import { create } from 'zustand'

const currentMonth = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

const shift = (month: string, delta: number): string => {
  const [y, m] = month.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

interface MonthState {
  selectedMonth: string
  setMonth: (month: string) => void
  previousMonth: () => void
  nextMonth: () => void
  resetToCurrent: () => void
}

export const useMonthStore = create<MonthState>((set, get) => ({
  selectedMonth: currentMonth(),
  setMonth: (month) => set({ selectedMonth: month }),
  previousMonth: () => set({ selectedMonth: shift(get().selectedMonth, -1) }),
  nextMonth: () => set({ selectedMonth: shift(get().selectedMonth, 1) }),
  resetToCurrent: () => set({ selectedMonth: currentMonth() }),
}))

export const formatMonthLabel = (month: string): string => {
  const [y, m] = month.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  const label = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
