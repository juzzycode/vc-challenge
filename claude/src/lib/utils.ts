import { NextResponse } from 'next/server'
import { getSession } from './auth'

export async function requireAuth(): Promise<
  { userId: string; email: string } | NextResponse
> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return session
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function getNextRecurrence(
  dueDate: Date,
  recurrence: string
): Date | null {
  switch (recurrence) {
    case 'daily':
      return addDays(dueDate, 1)
    case 'weekly':
      return addDays(dueDate, 7)
    case 'monthly':
      return addMonths(dueDate, 1)
    default:
      return null
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date(new Date().toDateString())
}

export function isDueWithinDays(
  date: Date | string | null | undefined,
  days: number
): boolean {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  const future = addDays(now, days)
  return d >= now && d <= future
}
