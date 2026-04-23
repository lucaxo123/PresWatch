import client from './client'
import type { Debt, DebtDirection, DebtType } from '../types'

export interface DebtPayload {
  name: string
  direction: DebtDirection
  type: DebtType
  amountPerInstallment: number
  installmentsTotal?: number | null
  installmentsPaid?: number | null
  paymentDay?: number | null
  dueDate?: string | null
  startDate: string
  categoryId?: number | null
  cardId?: number | null
}

export const getDebts = async (): Promise<Debt[]> => {
  const res = await client.get<Debt[]>('/debts')
  return res.data
}

export const createDebt = async (data: DebtPayload): Promise<Debt> => {
  const res = await client.post<Debt>('/debts', data)
  return res.data
}

export const updateDebt = async (id: number, data: DebtPayload): Promise<Debt> => {
  const res = await client.put<Debt>(`/debts/${id}`, data)
  return res.data
}

export const deleteDebt = async (id: number): Promise<void> => {
  await client.delete(`/debts/${id}`)
}

export const toggleDebt = async (id: number): Promise<Debt> => {
  const res = await client.patch<Debt>(`/debts/${id}/toggle`)
  return res.data
}

export const markDebtReceived = async (id: number): Promise<Debt> => {
  const res = await client.patch<Debt>(`/debts/${id}/mark-received`)
  return res.data
}

export const getDebtsTotal = async (): Promise<number> => {
  const res = await client.get<number>('/debts/total')
  return res.data
}
