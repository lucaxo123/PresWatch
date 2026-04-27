import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  lastActivity: number
  login: (token: string, user: User) => void
  logout: () => void
  setToken: (token: string) => void
  updateActivity: () => void
}

// Token lives in memory only — never written to localStorage.
// user + isAuthenticated are persisted so we can attempt a silent refresh on reload.
const memoryToken = { current: null as string | null }

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      lastActivity: Date.now(),
      login: (token, user) => {
        memoryToken.current = token
        set({ token, user, isAuthenticated: true, lastActivity: Date.now() })
      },
      logout: () => {
        memoryToken.current = null
        set({ token: null, user: null, isAuthenticated: false })
      },
      setToken: (token) => {
        memoryToken.current = token
        set({ token })
      },
      updateActivity: () => set({ lastActivity: Date.now() }),
    }),
    {
      name: 'preswatch-auth',
      // Persist only non-sensitive state — token is intentionally excluded
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // On rehydration, token is always null — must be restored via silent refresh
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AuthState>),
        token: null,
      }),
    }
  )
)

// Synchronous getter used by the axios interceptor — avoids React hook rules
export const getMemoryToken = () => memoryToken.current
