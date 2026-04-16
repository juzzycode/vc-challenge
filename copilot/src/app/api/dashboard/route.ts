import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { startOfDay, endOfDay, addDays } from 'date-fns'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekEnd = addDays(now, 7)

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      OR: [
        { dueDate: { gte: todayStart, lte: todayEnd }, completed: false },
        { dueDate: { lt: now }, completed: false }
      ]
    }
  })

  const bills = await prisma.bill.findMany({
    where: {
      userId: user.id,
      dueDate: { gte: now, lte: weekEnd },
      paid: false
    }
  })

  return NextResponse.json({ tasks, bills })
}