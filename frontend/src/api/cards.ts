import client from './client'
import type { Card } from '../types'

export interface CardPayload {
  bank: string
  last4: string
  color: string
}

export const getCards = async (): Promise<Card[]> => {
  const res = await client.get<Card[]>('/cards')
  return res.data
}

export const createCard = async (data: CardPayload): Promise<Card> => {
  const res = await client.post<Card>('/cards', data)
  return res.data
}

export const updateCard = async (id: number, data: CardPayload): Promise<Card> => {
  const res = await client.put<Card>(`/cards/${id}`, data)
  return res.data
}

export const deleteCard = async (id: number): Promise<void> => {
  await client.delete(`/cards/${id}`)
}
