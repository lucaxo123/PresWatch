import client from './client'
import type { Budget } from '../types'

export const getBudget = async (month: string): Promise<Budget | null> => {
  try {
    const res = await client.get<Budget>(`/budget?month=${month}`)
    return res.data
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } }).response?.status === 404) return null
    throw err
  }
}

export const upsertBudget = async (data: {
  amount: number
  month: string
}): Promise<Budget> => {
  const res = await client.put<Budget>('/budget', data)
  return res.data
}
