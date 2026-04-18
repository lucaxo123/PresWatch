import client from './client'
import type { Subscription } from '../types'

export interface SubscriptionPayload {
  name: string
  amount: number
  billingDay: number
  categoryId?: number | null
  startDate: string
  endDate?: string | null
}

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const res = await client.get<Subscription[]>('/subscriptions')
  return res.data
}

export const createSubscription = async (data: SubscriptionPayload): Promise<Subscription> => {
  const res = await client.post<Subscription>('/subscriptions', data)
  return res.data
}

export const updateSubscription = async (
  id: number,
  data: SubscriptionPayload
): Promise<Subscription> => {
  const res = await client.put<Subscription>(`/subscriptions/${id}`, data)
  return res.data
}

export const deleteSubscription = async (id: number): Promise<void> => {
  await client.delete(`/subscriptions/${id}`)
}

export const toggleSubscription = async (id: number): Promise<Subscription> => {
  const res = await client.patch<Subscription>(`/subscriptions/${id}/toggle`)
  return res.data
}

export const getSubscriptionTotal = async (): Promise<number> => {
  const res = await client.get<number>('/subscriptions/total')
  return res.data
}
