import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const startOfDay = new Date(now.toDateString())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)
  const in7Days = new Date(now)
  in7Days.setDate(in7Days.getDate() + 7)

  const [todayTasks, overdueTasks, upcomingBills, overdueBills] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: session.userId,
        completed: false,
        dueDate: { gte: startOfDay, lt: endOfDay },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.task.findMany({
      where: {
        userId: session.userId,
        completed: false,
        dueDate: { lt: startOfDay },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.bill.findMany({
      where: {
        userId: session.userId,
        paid: false,
        dueDate: { gte: now, lte: in7Days },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.bill.findMany({
      where: {
        userId: session.userId,
        paid: false,
        dueDate: { lt: now },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
  ])

  return NextResponse.json({ todayTasks, overdueTasks, upcomingBills, overdueBills })
}
