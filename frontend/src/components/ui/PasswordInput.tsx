import { type InputHTMLAttributes, type ReactNode, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, leftIcon, className = '', id, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-content-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className={`
              w-full h-11 rounded-lg border bg-surface-raised text-sm text-content-primary
              placeholder:text-content-muted
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
              disabled:bg-surface-muted disabled:cursor-not-allowed
              ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-line'}
              ${leftIcon ? 'pl-10' : 'pl-3'}
              pr-10
              ${className}
            `}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-content-muted hover:text-content-primary transition-colors"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-content-muted">{hint}</p>}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
