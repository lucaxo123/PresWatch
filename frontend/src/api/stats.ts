import client from './client'
import type { MonthlyStats, WeeklyBreakdown } from '../types'

export const getMonthlyStats = async (month: string): Promise<MonthlyStats> => {
  const res = await client.get<MonthlyStats>(`/stats/monthly?month=${month}`)
  return res.data
}

export const getWeeklyStats = async (month: string): Promise<WeeklyBreakdown[]> => {
  const res = await client.get<WeeklyBreakdown[]>(`/stats/weekly?month=${month}`)
  return res.data
}
