import { CreditCard } from 'lucide-react'
import type { Card } from '../../types'

interface CardBadgeProps {
  card: Card
  size?: 'sm' | 'md'
}

export const CardBadge = ({ card, size = 'sm' }: CardBadgeProps) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5'
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap text-white ${sizeClass}`}
      style={{ backgroundColor: card.color }}
      title={`${card.bank} ····${card.last4}`}
    >
      <CreditCard size={size === 'sm' ? 11 : 13} />
      {card.bank} ····{card.last4}
    </span>
  )
}
