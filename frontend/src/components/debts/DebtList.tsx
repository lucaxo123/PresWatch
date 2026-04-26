import { useState } from 'react'
import { Plus, Pencil, Trash2, Pause, Play, Check, Calendar, CreditCard } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { ProgressBar } from '../ui/ProgressBar'
import { EmptyState } from '../ui/EmptyState'
import { CardBadge } from './CardBadge'
import { DebtForm } from './DebtForm'
import {
  useDebts,
  useDeleteDebt,
  useToggleDebt,
  useMarkDebtReceived,
} from '../../hooks/useDebts'
import { useToastStore } from '../../stores/toastStore'
import { extractErrorMessage } from '../../api/client'
import type { Debt, DebtDirection } from '../../types'

const formatAmount = (amount: number): string =>
  `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface DebtListProps {
  direction: DebtDirection
}

export const DebtList = ({ direction }: DebtListProps) => {
  const { data: allDebts = [], isLoading } = useDebts()
  const deleteMutation = useDeleteDebt()
  const toggleMutation = useToggleDebt()
  const markReceived = useMarkDebtReceived()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Debt | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const debts = allDebts.filter((d) => d.direction === direction)

  const handleCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const handleEdit = (debt: Debt) => {
    setEditing(debt)
    setFormOpen(true)
  }
  const handleDelete = () => {
    if (confirmDeleteId === null) return
    deleteMutation.mutate(confirmDeleteId, {
      onSuccess: () => {
        toastSuccess('Deuda eliminada')
        setConfirmDeleteId(null)
      },
      onError: (err) => toastError(extractErrorMessage(err)),
    })
  }
  const handleToggle = (id: number) => {
    toggleMutation.mutate(id, {
      onError: (err) => toastError(extractErrorMessage(err)),
    })
  }
  const handleMarkReceived = (id: number) => {
    markReceived.mutate(id, {
      onSuccess: () => toastSuccess('Cuota marcada como cobrada'),
      onError: (err) => toastError(extractErrorMessage(err)),
    })
  }

  const title = direction === 'OWED_BY_ME' ? 'Deudas a pagar' : 'Deudas a cobrar'
  const emptyDescription =
    direction === 'OWED_BY_ME'
      ? 'Cargá una deuda para que se sume al calendario y al gasto del mes.'
      : 'Registrá lo que te deben para tenerlo a la vista en el calendario.'

  return (
    <>
      <div className="bg-surface-raised border border-line rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="text-sm font-semibold text-content-primary">{title}</h3>
          <Button size="sm" onClick={handleCreate}>
            <Plus size={14} />
            Agregar
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-content-muted text-sm">Cargando...</div>
        ) : debts.length === 0 ? (
          <EmptyState
            icon={direction === 'OWED_BY_ME' ? <CreditCard size={24} /> : <Calendar size={24} />}
            heading="Sin deudas"
            description={emptyDescription}
            action={{ label: 'Crear deuda', onClick: handleCreate, icon: <Plus size={14} /> }}
          />
        ) : (
          <div className="divide-y divide-line">
            {debts.map((debt) => {
              const isInstallments = debt.type === 'INSTALLMENTS'
              const total = debt.installmentsTotal ?? 1
              const paid = debt.installmentsPaid
              return (
                <div
                  key={debt.id}
                  className={`flex flex-col gap-2 py-3 px-4 transition-colors ${
                    debt.active ? '' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-content-primary">{debt.name}</span>
                        {debt.category && (
                          <Badge variant="soft" color={debt.category.color} size="sm" icon={debt.category.icon}>
                            {debt.category.name}
                          </Badge>
                        )}
                        {debt.card && <CardBadge card={debt.card} />}
                        {!debt.active && (
                          <Badge variant="soft" color="#a8a29e" size="sm">
                            Cerrada
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-content-muted mt-0.5">
                        {isInstallments
                          ? `Día ${debt.paymentDay} de cada mes · ${formatAmount(debt.amountPerInstallment)} × ${total} cuotas`
                          : `Vence el ${debt.dueDate ? formatDate(debt.dueDate) : '—'}`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold tabular-nums text-content-primary">
                        {formatAmount(debt.totalAmount)}
                      </div>
                      {isInstallments && (
                        <div className="text-[11px] text-content-muted tabular-nums">
                          {paid}/{total} cuotas
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {direction === 'OWED_TO_ME' && debt.active && (
                        <button
                          type="button"
                          onClick={() => handleMarkReceived(debt.id)}
                          aria-label="Marcar cuota cobrada"
                          title="Marcar cuota cobrada"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-success hover:bg-success/10 transition-colors"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggle(debt.id)}
                        aria-label={debt.active ? 'Pausar' : 'Activar'}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-muted transition-colors"
                      >
                        {debt.active ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(debt)}
                        aria-label="Editar"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-muted transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(debt.id)}
                        aria-label="Eliminar"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isInstallments && <ProgressBar value={paid} max={total} />}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <DebtForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        debt={editing}
        defaultDirection={direction}
      />

      <Modal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Eliminar deuda"
        description="Los gastos ya generados no se borrarán."
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
              Eliminar
            </Button>
          </div>
        }
      />
    </>
  )
}
