import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Target, PieChart, ShieldCheck, Wallet } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import { ThemeToggle } from '../components/ui/ThemeToggle'

const features = [
  {
    icon: Target,
    title: 'Presupuesto claro',
    description: 'Definí tu límite mensual y seguí tu avance día por día.',
  },
  {
    icon: PieChart,
    title: 'Gastos al detalle',
    description: 'Categorizá cada movimiento y visualizá a dónde va tu plata.',
  },
  {
    icon: ShieldCheck,
    title: 'Privado y seguro',
    description: 'Tus datos están protegidos y sólo vos los ves.',
  },
]

export const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) return <Navigate to="/app/resumen" replace />

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:w-1/2 bg-surface-muted relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-32 -translate-x-32 pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
            <Wallet size={22} strokeWidth={2.2} />
          </div>
          <span className="text-xl font-semibold text-content-primary tracking-tight">
            PresWatch
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold text-content-primary tracking-tight leading-tight">
            Tu presupuesto personal,
            <br />
            <span className="text-accent">claro y bajo control.</span>
          </h1>
          <p className="text-content-secondary mt-4 text-base leading-relaxed">
            Registrá gastos, seguí tu presupuesto y entendé tus finanzas con una herramienta
            simple y sobria.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-raised border border-line text-accent">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-content-primary">{title}</p>
                  <p className="text-sm text-content-muted mt-0.5">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-content-muted">
          © {new Date().getFullYear()} PresWatch
        </p>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 lg:p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent">
              <Wallet size={18} strokeWidth={2.2} />
            </div>
            <span className="text-base font-semibold text-content-primary tracking-tight">
              PresWatch
            </span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 pb-10">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-content-primary tracking-tight">
                {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear una cuenta'}
              </h2>
              <p className="text-sm text-content-muted mt-1">
                {mode === 'login'
                  ? 'Ingresá con tu email para continuar.'
                  : 'Registrate para empezar a controlar tus gastos.'}
              </p>
            </div>

            {mode === 'login' ? (
              <LoginForm onSwitchToRegister={() => setMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
