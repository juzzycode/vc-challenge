import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const items = await prisma.maintenanceItem.findMany({
    where: { userId: session.userId },
    orderBy: { name: 'asc' },
  })

  const now = new Date()

  const itemsWithStatus = items.map((item) => {
    let nextDue: Date | null = null
    let overdue = false
    let dueWithinWeek = false

    if (item.lastCompleted) {
      nextDue = new Date(item.lastCompleted)
      nextDue.setDate(nextDue.getDate() + item.frequencyDays)
      overdue = nextDue < now
      const in7 = new Date(now)
      in7.setDate(in7.getDate() + 7)
      dueWithinWeek = !overdue && nextDue <= in7
    } else {
      // Never completed — overdue immediately
      overdue = true
    }

    return { ...item, nextDue, overdue, dueWithinWeek }
  })

  let filtered = itemsWithStatus
  if (status === 'overdue') filtered = itemsWithStatus.filter((i) => i.overdue)
  else if (status === 'upcoming') filtered = itemsWithStatus.filter((i) => i.dueWithinWeek)

  return NextResponse.json({ items: filtered })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, lastCompleted, frequencyDays, notes } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!frequencyDays || isNaN(Number(frequencyDays)) || Number(frequencyDays) <= 0) {
    return NextResponse.json({ error: 'Valid frequency (days) is required' }, { status: 400 })
  }

  const item = await prisma.maintenanceItem.create({
    data: {
      userId: session.userId,
      name: name.trim(),
      lastCompleted: lastCompleted ? new Date(lastCompleted) : null,
      frequencyDays: Number(frequencyDays),
      notes: notes?.trim() || null,
    },
  })

  return NextResponse.json({ item }, { status: 201 })
}
