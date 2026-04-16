import { Pencil, Trash2 } from 'lucide-react'
import type { Expense } from '../../types'
import { Badge } from '../ui/Badge'

interface ExpenseRowProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: number) => void
  deleting?: boolean
}

export const ExpenseRow = ({ expense, onEdit, onDelete, deleting }: ExpenseRowProps) => {
  const date = new Date(expense.expenseDate + 'T00:00:00').toLocaleDateString('es-AR', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-center gap-3 py-4 px-3 hover:bg-surface-muted/60 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {expense.category ? (
            <Badge variant="soft" color={expense.category.color} icon={expense.category.icon}>
              {expense.category.name}
            </Badge>
          ) : (
            <Badge variant="soft" color="#a8a29e">Sin categoría</Badge>
          )}
          <span className="text-xs text-content-muted">{date}</span>
        </div>
        {expense.description && (
          <p className="text-sm text-content-secondary mt-1 truncate">{expense.description}</p>
        )}
      </div>

      <span className="text-base font-semibold tabular-nums text-content-primary shrink-0">
        ${expense.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </span>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(expense)}
          aria-label="Editar gasto"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-muted transition-colors"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(expense.id)}
          disabled={deleting}
          aria-label="Eliminar gasto"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-content-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
