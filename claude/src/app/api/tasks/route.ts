import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getNextRecurrence } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const now = new Date()
  const where: Record<string, unknown> = { userId: session.userId }

  if (status === 'completed') where.completed = true
  else if (status === 'active') where.completed = false
  else if (status === 'overdue') {
    where.completed = false
    where.dueDate = { lt: now }
  } else if (status === 'today') {
    const startOfDay = new Date(now.toDateString())
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)
    where.completed = false
    where.dueDate = { gte: startOfDay, lt: endOfDay }
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ tasks })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, dueDate, recurrence } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Task name is required' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      userId: session.userId,
      name: name.trim(),
      description: description?.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      recurrence: recurrence || 'none',
    },
  })

  return NextResponse.json({ task }, { status: 201 })
}
