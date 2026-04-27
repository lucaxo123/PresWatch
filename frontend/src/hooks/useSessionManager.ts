import { useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { silentRefresh } from '../api/auth'

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000
const ACTIVITY_WINDOW_MS = 10 * 60 * 1000
const CHECK_INTERVAL_MS = 60 * 1000
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const

const decodeTokenExpiry = (token: string): number | null => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized)) as { exp?: number }
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

const forceLogout = () => {
  useAuthStore.getState().logout()
  if (window.location.pathname !== '/auth') {
    window.location.href = '/auth'
  }
}

export const useSessionManager = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const token = useAuthStore((s) => s.token)
  const bootRefreshAttempted = useRef(false)

  useEffect(() => {
    const handler = () => useAuthStore.getState().updateActivity()
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }))
    return () => ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, handler))
  }, [])

  // On page reload: isAuthenticated is true (persisted) but token is null (in-memory only).
  // Try a silent refresh using the HttpOnly cookie before forcing logout.
  useEffect(() => {
    if (!isAuthenticated || token !== null || bootRefreshAttempted.current) return
    bootRefreshAttempted.current = true

    silentRefresh()
      .then(({ token: newToken }) => {
        useAuthStore.getState().setToken(newToken)
      })
      .catch(() => {
        forceLogout()
      })
  }, [isAuthenticated, token])

  // Proactive refresh when access token is close to expiry and user is active
  useEffect(() => {
    if (!isAuthenticated) return

    let refreshing = false

    const check = async () => {
      const { token: currentToken, lastActivity, setToken } = useAuthStore.getState()
      if (!currentToken || refreshing) return

      const expiresAt = decodeTokenExpiry(currentToken)
      if (!expiresAt) return

      const msUntilExpiry = expiresAt - Date.now()

      if (msUntilExpiry <= 0) {
        forceLogout()
        return
      }

      if (msUntilExpiry < REFRESH_THRESHOLD_MS) {
        const activeRecently = Date.now() - lastActivity < ACTIVITY_WINDOW_MS
        if (!activeRecently) return
        refreshing = true
        try {
          const { token: newToken } = await silentRefresh()
          setToken(newToken)
        } catch {
          forceLogout()
        } finally {
          refreshing = false
        }
      }
    }

    void check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isAuthenticated])
}
