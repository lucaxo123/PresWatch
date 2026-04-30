import { useSearchParams, Navigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex items-center justify-between p-4 lg:p-6">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent">
            <Wallet size={18} strokeWidth={2.2} />
          </div>
          <span className="text-base font-semibold text-content-primary tracking-tight">
            PresWatch
          </span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 pb-10">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-content-primary tracking-tight">
              Restablecer contraseña
            </h2>
            <p className="text-sm text-content-muted mt-1">
              Elegí una nueva contraseña segura para tu cuenta.
            </p>
          </div>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  )
}
