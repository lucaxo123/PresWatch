import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const variants = {
  primary:
    'bg-accent text-accent-contrast hover:bg-accent-hover shadow-card hover:shadow-elevated',
  secondary:
    'bg-surface-raised text-content-primary border border-line hover:bg-surface-muted',
  ghost:
    'text-content-secondary hover:text-content-primary hover:bg-surface-muted',
  outline:
    'border border-accent text-accent hover:bg-accent/10',
  danger:
    'bg-danger text-white hover:bg-danger/90 shadow-card',
}

const sizes = {
  sm: 'px-3 h-9 text-sm gap-1.5',
  md: 'px-4 h-10 text-sm gap-2',
  lg: 'px-5 h-12 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      fullWidth,
      children,
      className = '',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-150 ease-out-soft
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        active:scale-[0.98]
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
