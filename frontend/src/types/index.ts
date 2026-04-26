export interface User {
  userId: number
  email: string
  username: string
}

export interface AuthResponse {
  token: string
  userId: number
  email: string
  username: string
}

export interface Category {
  id: number
  name: string
  color: string
  icon: string | null
  isDefault: boolean
}

export interface Budget {
  id: number
  amount: number
  month: string
}

export interface Expense {
  id: number
  amount: number
  description: string | null
  expenseDate: string
  category: Category | null
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CategoryBreakdownItem {
  categoryId: number | null
  categoryName: string
  color: string
  icon: string | null
  amount: number
  percent: number
}

export interface MonthlyStats {
  month: string
  budget: number
  totalSpent: number
  remaining: number
  percentUsed: number
  categoryBreakdown: CategoryBreakdownItem[]
}

export interface WeeklyBreakdown {
  week: string
  startDate: string
  endDate: string
  total: number
}

export interface ExpenseFilters {
  month?: string
  categoryId?: number | null
  week?: string
  page?: number
}

export interface Subscription {
  id: number
  name: string
  amount: number
  billingDay: number
  active: boolean
  startDate: string
  endDate: string | null
  category: Category | null
  createdAt: string
}

export type DebtDirection = 'OWED_BY_ME' | 'OWED_TO_ME'
export type DebtType = 'INSTALLMENTS' | 'SINGLE'

export interface Card {
  id: number
  bank: string
  last4: string
  color: string
  createdAt: string
}

export interface Debt {
  id: number
  name: string
  direction: DebtDirection
  type: DebtType
  amountPerInstallment: number
  installmentsTotal: number | null
  installmentsPaid: number
  remainingInstallments: number | null
  totalAmount: number
  paymentDay: number | null
  dueDate: string | null
  startDate: string
  active: boolean
  category: Category | null
  card: Card | null
  createdAt: string
}

export interface CalendarDay {
  date: string
  expenses: Expense[]
  subscriptions: Subscription[]
  debts: Debt[]
}

export type CalendarData = Record<string, CalendarDay>
