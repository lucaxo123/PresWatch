import { describe, it, expect } from 'vitest'

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

const buildJwt = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fake-signature`
}

describe('decodeTokenExpiry', () => {
  it('extracts exp from a valid JWT', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = buildJwt({ sub: '1', exp })
    expect(decodeTokenExpiry(token)).toBe(exp * 1000)
  })

  it('returns null for token without exp', () => {
    const token = buildJwt({ sub: '1' })
    expect(decodeTokenExpiry(token)).toBeNull()
  })

  it('returns null for malformed token', () => {
    expect(decodeTokenExpiry('not-a-jwt')).toBeNull()
    expect(decodeTokenExpiry('')).toBeNull()
  })

  it('handles base64url encoding', () => {
    const exp = 1700000000
    const header = btoa(JSON.stringify({ alg: 'HS256' }))
    const body = btoa(JSON.stringify({ exp }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const token = `${header}.${body}.sig`
    expect(decodeTokenExpiry(token)).toBe(exp * 1000)
  })
})
