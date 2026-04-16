import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { WeeklyBreakdown } from '../../types'
import { Card } from '../ui/Card'
import { useThemeColors } from '../../hooks/useThemeColors'

interface WeeklyBarChartProps {
  data: WeeklyBreakdown[]
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-raised border border-line rounded-lg shadow-elevated px-3 py-2 text-sm">
      <p className="font-medium text-content-primary">{label}</p>
      <p className="text-content-muted tabular-nums">
        ${payload[0].value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}

export const WeeklyBarChart = ({ data }: WeeklyBarChartProps) => {
  const colors = useThemeColors()
  if (!data.length) return null

  const chartData = data.map((w) => ({
    name: w.week.replace('-', ' ').replace('W', 'Sem. '),
    total: w.total,
  }))

  return (
    <Card padding="md">
      <h3 className="text-sm font-semibold text-content-primary mb-4">Por semana</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: colors.textSecondary }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: colors.textMuted }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.surfaceMuted }} />
          <Bar dataKey="total" fill={colors.accent} radius={[6, 6, 0, 0]} maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
