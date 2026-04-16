import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  cycle: () => void
}

const applyDomClass = (mode: ThemeMode) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => {
        applyDomClass(mode)
        set({ mode })
      },
      cycle: () => {
        const order: ThemeMode[] = ['light', 'dark', 'system']
        const current = get().mode
        const next = order[(order.indexOf(current) + 1) % order.length]
        applyDomClass(next)
        set({ mode: next })
      },
    }),
    {
      name: 'preswatch-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyDomClass(state.mode)
      },
    }
  )
)

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const mode = useThemeStore.getState().mode
    if (mode === 'system') applyDomClass('system')
  })
}
