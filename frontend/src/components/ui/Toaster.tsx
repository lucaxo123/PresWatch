import { createPortal } from 'react-dom'
import { useToastStore } from '../../stores/toastStore'
import { Toast } from './Toast'

export const Toaster = () => {
  const toasts = useToastStore((s) => s.toasts)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed z-[100] bottom-4 right-4 flex flex-col gap-2 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  )
}
