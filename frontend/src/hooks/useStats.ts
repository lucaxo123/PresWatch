import { useQuery } from '@tanstack/react-query'
import { getMonthlyStats, getWeeklyStats } from '../api/stats'

export const useMonthlyStats = (month: string) =>
  useQuery({
    queryKey: ['stats', 'monthly', month],
    queryFn: () => getMonthlyStats(month),
  })

export const useWeeklyStats = (month: string) =>
  useQuery({
    queryKey: ['stats', 'weekly', month],
    queryFn: () => getWeeklyStats(month),
  })
