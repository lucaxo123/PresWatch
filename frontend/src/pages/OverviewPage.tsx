import { useState, useEffect } from 'react'
import { BudgetCard } from '../components/budget/BudgetCard'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { useMonthlyStats } from '../hooks/useStats'
import { useMonthStore } from '../stores/monthStore'
import type { ExpenseFilters } from '../types'

export const OverviewPage = () => {
  const month = useMonthStore((s) => s.selectedMonth)
  const [filters, setFilters] = useState<ExpenseFilters>({ month, page: 0 })
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(month)

  useEffect(() => {
    setFilters((f) => ({ ...f, month, page: 0 }))
  }, [month])

  return (
    <div className="flex flex-col gap-6">
      <BudgetCard
        month={month}
        totalSpent={stats?.totalSpent ?? 0}
        isLoadingStats={statsLoading}
      />
      <ExpenseList filters={filters} onFiltersChange={setFilters} />
    </div>
  )
}
