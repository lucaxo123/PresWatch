import { useState, useRef, useEffect } from 'react'
import { Wallet, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { logout as apiLogout } from '../../api/auth'
import { ThemeToggle } from '../ui/ThemeToggle'
import { MonthSwitcher } from './MonthSwitcher'

export const TopBar = () => {
  const user = useAuthStore((s) => s.user)
  const storeLogout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    await apiLogout()
    storeLogout()
    window.location.href = '/auth'
  }
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const initial = (user?.username ?? 'U').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-surface-raised/90 backdrop-blur-md border-b border-line">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent">
              <Wallet size={18} strokeWidth={2.2} />
            </div>
            <span className="text-base font-semibold text-content-primary tracking-tight">
              PresWatch
            </span>
          </div>

          <div className="hidden md:flex items-center">
            <MonthSwitcher />
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menú de usuario"
                aria-expanded={menuOpen}
                className="inline-flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-surface-muted transition-colors"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-contrast text-xs font-semibold">
                  {initial}
                </span>
                <span className="hidden sm:block text-sm text-content-secondary max-w-[100px] truncate">
                  {user?.username}
                </span>
                <ChevronDown size={14} className="hidden sm:block text-content-muted" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-surface-raised border border-line rounded-xl shadow-elevated overflow-hidden animate-slide-up">
                  <div className="px-4 py-3 border-b border-line">
                    <p className="text-xs text-content-muted">Sesión</p>
                    <p className="text-sm font-medium text-content-primary truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      void handleLogout()
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-content-secondary hover:text-danger hover:bg-surface-muted transition-colors"
                  >
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden pb-3 flex justify-center">
          <MonthSwitcher />
        </div>
      </div>
    </header>
  )
}
