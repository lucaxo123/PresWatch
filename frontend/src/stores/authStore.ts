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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      lastActivity: Date.now(),
      login: (token, user) =>
        set({ token, user, isAuthenticated: true, lastActivity: Date.now() }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setToken: (token) => set({ token }),
      updateActivity: () => set({ lastActivity: Date.now() }),
    }),
    {
      name: 'preswatch-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
