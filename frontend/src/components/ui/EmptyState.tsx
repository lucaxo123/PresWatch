import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  heading: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  children?: ReactNode
}

export const EmptyState = ({ icon, heading, description, action, children }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
    {icon && (
      <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent">
        {typeof icon === 'string' ? <span className="text-3xl">{icon}</span> : icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-content-primary mb-1">{heading}</h3>
    {description && (
      <p className="text-sm text-content-muted mb-5 max-w-xs">{description}</p>
    )}
    {action && (
      <Button onClick={action.onClick}>
        {action.icon}
        {action.label}
      </Button>
    )}
    {children}
  </div>
)
