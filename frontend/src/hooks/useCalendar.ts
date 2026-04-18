import { useQuery } from '@tanstack/react-query'
import { getCalendarData } from '../api/calendar'

export const useCalendarData = (month: string) =>
  useQuery({
    queryKey: ['calendar', month],
    queryFn: () => getCalendarData(month),
  })
