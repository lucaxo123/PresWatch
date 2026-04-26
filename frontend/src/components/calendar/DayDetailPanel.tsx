import { X, Receipt, RefreshCw, CreditCard } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { CardBadge } from '../debts/CardBadge'
import type { CalendarDay } from '../../types'

interface DayDetailPanelProps {
  date: string
  data: CalendarDay | undefined
  onClose: () => void
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const formatAmount = (amount: number): string =>
  `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

export const DayDetailPanel = ({ date, data, onClose }: DayDetailPanelProps) => {
  const expenses = data?.expenses ?? []
  const subscriptions = data?.subscriptions ?? []
  const debts = data?.debts ?? []
  const isEmpty = expenses.length === 0 && subscriptions.length === 0 && debts.length === 0

  return (
    <div className="bg-surface-raised border border-line rounded-xl shadow-card animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-line">
        <h3 className="text-sm font-semibold text-content-primary capitalize">
          {formatDate(date)}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-muted transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
        {isEmpty && (
          <p className="text-sm text-content-muted text-center py-4">
            Sin movimientos este día
          </p>
        )}

        {subscriptions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={14} className="text-success" />
              <span className="text-xs font-medium uppercase tracking-wider text-content-muted">
                Suscripciones
              </span>
            </div>
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {sub.category ? (
                      <Badge variant="soft" color={sub.category.color} size="sm" icon={sub.category.icon}>
                        {sub.category.name}
                      </Badge>
                    ) : null}
                    <span className="text-sm text-content-primary truncate">{sub.name}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-content-primary shrink-0 ml-2">
                    {formatAmount(sub.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {debts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} className="text-warning" />
              <span className="text-xs font-medium uppercase tracking-wider text-content-muted">
                Deudas
              </span>
            </div>
            <div className="space-y-2">
              {debts.map((debt) => {
                const isOwed = debt.direction === 'OWED_BY_ME'
                const installmentLabel =
                  debt.type === 'INSTALLMENTS' &&
                  debt.installmentsTotal != null &&
                  debt.installmentsPaid < debt.installmentsTotal
                    ? `cuota ${debt.installmentsPaid + 1}/${debt.installmentsTotal}`
                    : null
                return (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-muted/50"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <Badge variant="soft" color={isOwed ? '#C2410C' : '#16A34A'} size="sm">
                        {isOwed ? 'Yo debo' : 'Me deben'}
                      </Badge>
                      <span className="text-sm text-content-primary truncate">{debt.name}</span>
                      {installmentLabel && (
                        <span className="text-xs text-content-muted">{installmentLabel}</span>
                      )}
                      {debt.card && <CardBadge card={debt.card} />}
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-content-primary shrink-0 ml-2">
                      {formatAmount(debt.amountPerInstallment)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {expenses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={14} className="text-accent" />
              <span className="text-xs font-medium uppercase tracking-wider text-content-muted">
                Gastos
              </span>
            </div>
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {expense.category ? (
                      <Badge variant="soft" color={expense.category.color} size="sm" icon={expense.category.icon}>
                        {expense.category.name}
                      </Badge>
                    ) : (
                      <Badge variant="soft" color="#a8a29e" size="sm">Sin categoría</Badge>
                    )}
                    {expense.description && (
                      <span className="text-sm text-content-secondary truncate">
                        {expense.description}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-content-primary shrink-0 ml-2">
                    {formatAmount(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
