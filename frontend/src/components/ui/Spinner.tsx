import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 16, md: 22, lg: 32 }

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => (
  <Loader2 size={sizes[size]} className={`animate-spin text-accent ${className}`} />
)
