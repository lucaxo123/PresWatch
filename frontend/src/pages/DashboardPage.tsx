import { useState } from 'react'
import { BarChart3, Wallet, TrendingUp, Trophy, Target } from 'lucide-react'
import { useMonthlyStats, useWeeklyStats } from '../hooks/useStats'
import { useBudget } from '../hooks/useBudget'
import { CategoryPieChart } from '../components/charts/CategoryPieChart'
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart'
import { StatTile } from '../components/ui/StatTile'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { useMonthStore, formatMonthLabel } from '../stores/monthStore'

type ChartView = 'category' | 'weekly'

const formatCurrency = (value: number) =>
  value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const DashboardPage = () => {
  const month = useMonthStore((s) => s.selectedMonth)
  const [view, setView] = useState<ChartView>('category')
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(month)
  const { data: weekly = [] } = useWeeklyStats(month)
  const { data: budget } = useBudget(month)

  const now = new Date()
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const divisor = month === currentKey ? now.getDate() : new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()
  const avgPerDay = stats && stats.totalSpent > 0 ? stats.totalSpent / divisor : 0
  const topCategory = stats?.categoryBreakdown[0]
  const budgetUsedPct =
    budget && budget.amount > 0 ? ((stats?.totalSpent ?? 0) / budget.amount) * 100 : 0
  const overBudget = budgetUsedPct > 100

  const hasData = stats && stats.totalSpent > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-content-primary tracking-tight">
          Estadísticas
        </h1>
        <p className="text-sm text-content-muted mt-1">{formatMonthLabel(month)}</p>
      </div>

      {statsLoading ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} height={92} rounded="lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i + 2} height={92} rounded="lg" />
            ))}
          </div>
        </div>
      ) : !hasData ? (
        <EmptyState
          icon={<BarChart3 size={26} />}
          heading="Sin datos todavía"
          description="Agregá algunos gastos para ver tus estadísticas acá."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                label="Total gastado"
                value={`$${formatCurrency(stats.totalSpent)}`}
                icon={<Wallet size={14} />}
              />
              <StatTile
                label="Promedio por día"
                value={`$${formatCurrency(avgPerDay)}`}
                icon={<TrendingUp size={14} />}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                label="Top categoría"
                value={topCategory ? topCategory.categoryName : '—'}
                hint={topCategory ? `$${formatCurrency(topCategory.amount)}` : undefined}
                icon={<Trophy size={14} />}
              />
              <StatTile
                label="Presupuesto usado"
                value={budget ? `${budgetUsedPct.toFixed(0)}%` : '—'}
                hint={budget ? (overBudget ? 'Excedido' : 'En control') : 'Sin definir'}
                tone={overBudget ? 'danger' : 'default'}
                icon={<Target size={14} />}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <SegmentedControl
              value={view}
              onChange={setView}
              options={[
                { value: 'category', label: 'Por categoría' },
                { value: 'weekly', label: 'Por semana' },
              ]}
            />
          </div>

          {view === 'category' ? (
            <CategoryPieChart data={stats.categoryBreakdown} />
          ) : (
            <WeeklyBarChart data={weekly} />
          )}
        </>
      )}
    </div>
  )
}
