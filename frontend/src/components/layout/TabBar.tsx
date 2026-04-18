import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, BarChart3 } from 'lucide-react'

const tabs = [
  { to: '/app/resumen', label: 'Resumen', Icon: LayoutDashboard },
  { to: '/app/calendario', label: 'Calendario', Icon: CalendarDays },
  { to: '/app/estadisticas', label: 'Estadísticas', Icon: BarChart3 },
]

interface TabBarProps {
  variant?: 'mobile' | 'desktop'
}

export const TabBar = ({ variant = 'mobile' }: TabBarProps) => {
  if (variant === 'desktop') {
    return (
      <nav className="flex items-center gap-1" aria-label="Secciones">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-4 h-11 text-sm font-medium transition-colors
               border-b-2 -mb-px
               ${isActive
                 ? 'text-accent border-accent'
                 : 'text-content-secondary border-transparent hover:text-content-primary'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.3 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    )
  }

  return (
    <nav className="flex items-stretch" aria-label="Secciones">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors
             ${isActive ? 'text-accent' : 'text-content-muted hover:text-content-secondary'}`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`inline-flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                  isActive ? 'bg-accent/10' : ''
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.3 : 2} />
              </div>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
