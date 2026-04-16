import { useState } from 'react'
import { Plus, Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDeleteExpense, useExpenses } from '../../hooks/useExpenses'
import { useCategories } from '../../hooks/useCategories'
import { useToastStore } from '../../stores/toastStore'
import type { Expense, ExpenseFilters } from '../../types'
import { ExpenseRow } from './ExpenseRow'
import { ExpenseForm } from './ExpenseForm'
import { ExpenseFiltersBar } from './ExpenseFilters'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Modal } from '../ui/Modal'
import { Skeleton } from '../ui/Skeleton'

interface ExpenseListProps {
  filters: ExpenseFilters
  onFiltersChange: (filters: ExpenseFilters) => void
}

export const ExpenseList = ({ filters, onFiltersChange }: ExpenseListProps) => {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const { data, isLoading } = useExpenses(filters)
  const { data: categories = [] } = useCategories()
  const deleteExpense = useDeleteExpense()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const handleEdit = (expense: Expense) => {
    setEditing(expense)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditing(undefined)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirm === null) return
    deleteExpense.mutate(deleteConfirm, {
      onSuccess: () => {
        toastSuccess('Gasto eliminado')
        setDeleteConfirm(null)
      },
      onError: () => toastError('No se pudo eliminar el gasto'),
    })
  }

  const expenses = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const currentPage = filters.page ?? 0

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-content-primary tracking-tight">Gastos</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          <Plus size={16} />
          Nuevo gasto
        </Button>
      </div>

      <ExpenseFiltersBar
        filters={filters}
        categories={categories}
        onChange={(f) => onFiltersChange({ ...f, page: 0 })}
      />

      <Card className="mt-4" padding="sm">
        {isLoading ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-4 px-3">
                <div className="flex-1 space-y-2">
                  <Skeleton width={120} height={16} />
                  <Skeleton width={200} height={12} />
                </div>
                <Skeleton width={70} height={18} />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt size={26} />}
            heading="Todavía no hay gastos"
            description="Agregá tu primer gasto para empezar a controlar tu presupuesto."
            action={{
              label: 'Nuevo gasto',
              icon: <Plus size={16} />,
              onClick: () => setFormOpen(true),
            }}
          />
        ) : (
          <div className="divide-y divide-line">
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteConfirm(id)}
                deleting={deleteExpense.isPending && deleteConfirm === expense.id}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-line mt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => onFiltersChange({ ...filters, page: currentPage - 1 })}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            <span className="text-sm text-content-muted tabular-nums px-2">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onFiltersChange({ ...filters, page: currentPage + 1 })}
              aria-label="Página siguiente"
            >
              Siguiente
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </Card>

      <ExpenseForm open={formOpen} onClose={handleCloseForm} expense={editing} />

      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="¿Eliminar gasto?"
        description="Esta acción no se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteExpense.isPending}
              onClick={handleDeleteConfirm}
            >
              Eliminar
            </Button>
          </>
        }
      />
    </>
  )
}
