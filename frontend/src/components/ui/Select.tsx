import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-content-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-11 rounded-lg border bg-surface-raised text-sm text-content-primary
              appearance-none pl-3 pr-9
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
              disabled:bg-surface-muted disabled:cursor-not-allowed
              ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-line'}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
