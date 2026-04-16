import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

const mockUser = { userId: 1, email: 'test@test.com', username: 'testuser' }

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })

  it('login sets token, user, and isAuthenticated', () => {
    useAuthStore.getState().login('jwt-token', mockUser)
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe('jwt-token')
    expect(state.user).toEqual(mockUser)
  })

  it('logout clears all auth state', () => {
    useAuthStore.getState().login('jwt-token', mockUser)
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
  })

  it('setToken replaces only the token', () => {
    useAuthStore.getState().login('old-token', mockUser)
    useAuthStore.getState().setToken('new-token')
    const state = useAuthStore.getState()
    expect(state.token).toBe('new-token')
    expect(state.user).toEqual(mockUser)
  })

  it('updateActivity refreshes lastActivity timestamp', () => {
    const before = Date.now()
    useAuthStore.getState().updateActivity()
    const after = useAuthStore.getState().lastActivity
    expect(after).toBeGreaterThanOrEqual(before)
  })
})
