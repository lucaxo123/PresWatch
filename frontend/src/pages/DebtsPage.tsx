import { useMemo, useState } from 'react'
import { TrendingDown, TrendingUp, CreditCard } from 'lucide-react'
import { StatTile } from '../components/ui/StatTile'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { DebtList } from '../components/debts/DebtList'
import { CardsManagementSection } from '../components/debts/CardsManagementSection'
import { useDebts, useDebtsTotal } from '../hooks/useDebts'

const formatAmount = (amount: number): string =>
  `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

type Tab = 'OWED_BY_ME' | 'OWED_TO_ME' | 'CARDS'

export const DebtsPage = () => {
  const [tab, setTab] = useState<Tab>('OWED_BY_ME')
  const { data: debts = [] } = useDebts()
  const { data: totalToPay = 0 } = useDebtsTotal()

  const totalToCollect = useMemo(
    () =>
      debts
        .filter((d) => d.direction === 'OWED_TO_ME' && d.active)
        .reduce((acc, d) => {
          const remaining = d.remainingInstallments ?? 1
          return acc + d.amountPerInstallment * remaining
        }, 0),
    [debts]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile
          label="A pagar este mes"
          value={formatAmount(totalToPay)}
          hint="Cuotas y pagos únicos del mes"
          icon={<TrendingDown size={16} />}
          tone="danger"
        />
        <StatTile
          label="Por cobrar"
          value={formatAmount(totalToCollect)}
          hint="Total pendiente de deudas a favor"
          icon={<TrendingUp size={16} />}
          tone="success"
        />
      </div>

      <SegmentedControl<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'OWED_BY_ME', label: 'Yo debo', icon: <TrendingDown size={14} /> },
          { value: 'OWED_TO_ME', label: 'Me deben', icon: <TrendingUp size={14} /> },
          { value: 'CARDS', label: 'Tarjetas', icon: <CreditCard size={14} /> },
        ]}
        ariaLabel="Sección de deudas"
      />

      {tab === 'CARDS' ? <CardsManagementSection /> : <DebtList direction={tab} />}
    </div>
  )
}
