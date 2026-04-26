import client from './client'
import type { CalendarData } from '../types'

export const getCalendarData = async (month: string): Promise<CalendarData> => {
  const res = await client.get<CalendarData>(`/calendar?month=${month}`)
  return res.data
}
