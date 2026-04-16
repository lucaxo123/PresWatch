import { useState } from 'react'
import { Pencil, TrendingUp, CalendarDays } from 'lucide-react'
import { useBudget, useUpsertBudget } from '../../hooks/useBudget'
import { useToastStore } from '../../stores/toastStore'
import { extractErrorMessage } from '../../api/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { ProgressBar } from '../ui/ProgressBar'
import { Skeleton } from '../ui/Skeleton'

interface BudgetCardProps {
  month: string
  totalSpent: number
  isLoadingStats: boolean
}

const formatCurrency = (value: number) =>
  value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const daysRemainingInMonth = (month: string): number => {
  const [y, m] = month.split('-').map(Number)
  const now = new Date()
  const lastDay = new Date(y, m, 0)
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  if (month !== currentMonthKey) return lastDay.getDate()
  return Math.max(0, lastDay.getDate() - now.getDate() + 1)
}

export const BudgetCard = ({ month, totalSpent, isLoadingStats }: BudgetCardProps) => {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const { data: budget, isLoading } = useBudget(month)
  const upsert = useUpsertBudget()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(amount.replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      setFormError('Ingresá un monto válido mayor a cero')
      return
    }
    setFormError(null)
    upsert.mutate(
      { amount: val, month },
      {
        onSuccess: () => {
          toastSuccess('Presupuesto actualizado')
          setOpen(false)
        },
        onError: (err) => toastError(extractErrorMessage(err)),
      }
    )
  }

  const handleOpen = () => {
    setAmount(budget?.amount?.toString() ?? '')
    setFormError(null)
    setOpen(true)
  }

  const pct = budget && budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0
  const over = budget ? totalSpent > budget.amount : false
  const remaining = budget ? budget.amount - totalSpent : 0
  const daysLeft = daysRemainingInMonth(month)
  const suggestedPerDay = budget && daysLeft > 0 && !over ? remaining / daysLeft : 0

  return (
    <>
      <Card padding="lg" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
              Presupuesto del mes
            </p>
            {isLoading ? (
              <Skeleton width={180} height={40} className="mt-2" />
            ) : budget ? (
              <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-semibold tabular-nums text-content-primary tracking-tight">
                  ${formatCurrency(totalSpent)}
                </span>
                <span className="text-base text-content-muted tabular-nums">
                  / ${formatCurrency(budget.amount)}
                </span>
              </div>
            ) : (
              <p className="text-content-muted text-sm mt-2">
                Todavía no configuraste un presupuesto mensual
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpen}
            aria-label={budget ? 'Editar presupuesto' : 'Configurar presupuesto'}
          >
            <Pencil size={15} />
            {budget ? 'Editar' : 'Configurar'}
          </Button>
        </div>

        {budget && (
          <div className="relative space-y-4">
            {isLoadingStats ? (
              <Skeleton height={10} rounded="full" />
            ) : (
              <ProgressBar value={pct} variant={over ? 'danger' : 'default'} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-content-muted uppercase tracking-wide font-medium flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  {over ? 'Excedido' : 'Restante'}
                </span>
                <span
                  className={`text-lg font-semibold tabular-nums mt-0.5 ${
                    over ? 'text-danger' : 'text-content-primary'
                  }`}
                >
                  ${formatCurrency(Math.abs(remaining))}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-content-muted uppercase tracking-wide font-medium flex items-center gap-1.5">
                  <CalendarDays size={12} />
                  {daysLeft > 0 ? 'Sugerido por día' : 'Días restantes'}
                </span>
                <span className="text-lg font-semibold tabular-nums mt-0.5 text-content-primary">
                  {suggestedPerDay > 0
                    ? `$${formatCurrency(suggestedPerDay)}`
                    : `${daysLeft} día${daysLeft === 1 ? '' : 's'}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={budget ? 'Editar presupuesto' : 'Configurar presupuesto'}
        description="Definí cuánto planeás gastar este mes."
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Monto mensual"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="ej. 250000"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              if (formError) setFormError(null)
            }}
            error={formError ?? undefined}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={upsert.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
