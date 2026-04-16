import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
}: ModalProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-stone-950/50 dark:bg-stone-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          relative bg-surface-raised rounded-t-2xl sm:rounded-2xl shadow-elevated
          border-t sm:border border-line
          w-full ${sizes[size]} max-h-[90vh] overflow-hidden
          flex flex-col animate-scale-in
        `}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-line">
          <div className="min-w-0 flex-1">
            <h2 id="modal-title" className="text-lg font-semibold text-content-primary">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-content-secondary mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="p-5 border-t border-line bg-surface-muted/30">{footer}</div>
        )}
      </div>
    </div>
  )
}
