import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '../../stores/themeStore'

const options: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Oscuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
]

export const ThemeToggle = () => {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = options.find((o) => o.value === mode) ?? options[2]
  const CurrentIcon = current.Icon

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Tema (actual: ${current.label})`}
        aria-expanded={open}
        aria-haspopup="menu"
        title={`Tema: ${current.label}`}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-muted transition-colors"
      >
        <CurrentIcon size={18} strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-40 bg-surface-raised border border-line rounded-xl shadow-elevated overflow-hidden animate-slide-up z-40"
        >
          {options.map(({ value, label, Icon }) => {
            const active = value === mode
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setMode(value)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'text-accent bg-accent/10'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-muted'
                }`}
              >
                <Icon size={15} />
                <span className="flex-1 text-left">{label}</span>
                {active && <Check size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
