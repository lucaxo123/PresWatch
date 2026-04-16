import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CategoryBreakdownItem } from '../../types'
import { Card } from '../ui/Card'
import { useThemeColors } from '../../hooks/useThemeColors'

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[]
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: CategoryBreakdownItem }>
}) => {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="bg-surface-raised border border-line rounded-lg shadow-elevated px-3 py-2 text-sm">
      <p className="font-medium text-content-primary">{item.categoryName}</p>
      <p className="text-content-muted tabular-nums">
        ${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })} (
        {item.percent.toFixed(1)}%)
      </p>
    </div>
  )
}

export const CategoryPieChart = ({ data }: CategoryPieChartProps) => {
  const colors = useThemeColors()
  if (!data.length) return null

  return (
    <Card padding="md">
      <h3 className="text-sm font-semibold text-content-primary mb-4">Por categoría</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            stroke={colors.surfaceRaised}
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-content-secondary">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
