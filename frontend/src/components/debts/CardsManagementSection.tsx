import { useState } from 'react'
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { CardForm } from './CardForm'
import { useCards, useDeleteCard } from '../../hooks/useCards'
import { useToastStore } from '../../stores/toastStore'
import { extractErrorMessage } from '../../api/client'
import type { Card } from '../../types'

export const CardsManagementSection = () => {
  const { data: cards = [], isLoading } = useCards()
  const deleteMutation = useDeleteCard()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Card | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const handleCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const handleEdit = (card: Card) => {
    setEditing(card)
    setFormOpen(true)
  }

  const handleDelete = () => {
    if (confirmDeleteId === null) return
    deleteMutation.mutate(confirmDeleteId, {
      onSuccess: () => {
        toastSuccess('Tarjeta eliminada')
        setConfirmDeleteId(null)
      },
      onError: (err) => toastError(extractErrorMessage(err)),
    })
  }

  return (
    <>
      <div className="bg-surface-raised border border-line rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="text-sm font-semibold text-content-primary">Tarjetas</h3>
          <Button size="sm" onClick={handleCreate}>
            <Plus size={14} />
            Agregar
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-content-muted text-sm">Cargando...</div>
        ) : cards.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={24} />}
            heading="Sin tarjetas"
            description="Agregá una tarjeta para asociarla a tus deudas en cuotas."
            action={{ label: 'Crear tarjeta', onClick: handleCreate, icon: <Plus size={14} /> }}
          />
        ) : (
          <div className="divide-y divide-line">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 py-3 px-4">
                <div
                  className="w-10 h-7 rounded-md flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: card.color }}
                >
                  <CreditCard size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-content-primary">{card.bank}</div>
                  <div className="text-xs text-content-muted tabular-nums">····{card.last4}</div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(card)}
                    aria-label="Editar"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-muted transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(card.id)}
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

      <CardForm open={formOpen} onClose={() => setFormOpen(false)} card={editing} />

      <Modal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Eliminar tarjeta"
        description="Las deudas asociadas quedarán sin tarjeta, pero no se eliminarán."
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
