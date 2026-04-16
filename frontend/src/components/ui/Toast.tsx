import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore, type Toast as ToastType } from '../../stores/toastStore'

interface ToastProps {
  toast: ToastType
}

const variantStyles = {
  success: {
    icon: CheckCircle2,
    color: 'text-success',
    ring: 'ring-success/20',
  },
  error: {
    icon: XCircle,
    color: 'text-danger',
    ring: 'ring-danger/20',
  },
  info: {
    icon: Info,
    color: 'text-accent',
    ring: 'ring-accent/20',
  },
} as const

export const Toast = ({ toast }: ToastProps) => {
  const dismiss = useToastStore((s) => s.dismiss)
  const { icon: Icon, color, ring } = variantStyles[toast.variant]

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={`
        pointer-events-auto flex items-start gap-3
        min-w-[280px] max-w-[360px]
        bg-surface-raised border border-line rounded-xl shadow-elevated
        px-4 py-3 ring-1 ${ring}
        animate-slide-up
      `}
    >
      <Icon size={20} className={`shrink-0 mt-0.5 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-content-primary">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-content-secondary mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="shrink-0 text-content-muted hover:text-content-primary transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}
