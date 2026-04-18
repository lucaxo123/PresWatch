import { useState } from 'react'
import { Plus, Pencil, Trash2, Pause, Play } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { SubscriptionForm } from './SubscriptionForm'
import {
  useSubscriptions,
  useDeleteSubscription,
  useToggleSubscription,
} from '../../hooks/useSubscriptions'
import { useToastStore } from '../../stores/toastStore'
import { extractErrorMessage } from '../../api/client'
import type { Subscription } from '../../types'

const formatAmount = (amount: number): string =>
  `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

export const SubscriptionList = () => {
  const { data: subscriptions = [], isLoading } = useSubscriptions()
  const deleteMutation = useDeleteSubscription()
  const toggleMutation = useToggleSubscription()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const handleEdit = (sub: Subscription) => {
    setEditing(sub)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const handleDelete = () => {
    if (confirmDeleteId === null) return
    deleteMutation.mutate(confirmDeleteId, {
      onSuccess: () => {
        toastSuccess('Suscripción eliminada')
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

  return (
    <>
      <div className="bg-surface-raised border border-line rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="text-sm font-semibold text-content-primary">Suscripciones</h3>
          <Button size="sm" onClick={handleCreate}>
            <Plus size={14} />
            Agregar
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-content-muted text-sm">Cargando...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-content-muted text-sm">
            No tenés suscripciones activas
          </div>
        ) : (
          <div className="divide-y divide-line">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`flex items-center gap-3 py-3 px-4 transition-colors ${
                  sub.active ? '' : 'opacity-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-content-primary">{sub.name}</span>
                    {sub.category && (
                      <Badge variant="soft" color={sub.category.color} size="sm" icon={sub.category.icon}>
                        {sub.category.name}
                      </Badge>
                    )}
                    {!sub.active && (
                      <Badge variant="soft" color="#a8a29e" size="sm">Pausada</Badge>
                    )}
                  </div>
                  <p className="text-xs text-content-muted mt-0.5">
                    Día {sub.billingDay} de cada mes
                  </p>
                </div>

                <span className="text-sm font-semibold tabular-nums text-content-primary shrink-0">
                  {formatAmount(sub.amount)}
                </span>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(sub.id)}
                    aria-label={sub.active ? 'Pausar' : 'Activar'}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-muted transition-colors"
                  >
                    {sub.active ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(sub)}
                    aria-label="Editar"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-muted transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(sub.id)}
                    aria-label="Eliminar"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SubscriptionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        subscription={editing}
      />

      <Modal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Eliminar suscripción"
        description="¿Estás seguro de que querés eliminar esta suscripción? Los gastos generados no se eliminarán."
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
