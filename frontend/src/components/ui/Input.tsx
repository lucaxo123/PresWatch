import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
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
            className={`
              w-full h-11 rounded-lg border bg-surface-raised text-sm text-content-primary
              placeholder:text-content-muted
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
              disabled:bg-surface-muted disabled:cursor-not-allowed
              ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-line'}
              ${leftIcon ? 'pl-10' : 'px-3'}
              ${rightIcon ? 'pr-10' : 'pr-3'}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-content-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
