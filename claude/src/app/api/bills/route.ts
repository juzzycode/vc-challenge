import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { addMonths } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const now = new Date()
  const where: Record<string, unknown> = { userId: session.userId }

  if (status === 'paid') where.paid = true
  else if (status === 'unpaid') where.paid = false
  else if (status === 'overdue') {
    where.paid = false
    where.dueDate = { lt: now }
  } else if (status === 'upcoming') {
    const in7Days = new Date(now)
    in7Days.setDate(in7Days.getDate() + 7)
    where.paid = false
    where.dueDate = { gte: now, lte: in7Days }
  }

  const bills = await prisma.bill.findMany({
    where,
    orderBy: [{ paid: 'asc' }, { dueDate: 'asc' }],
  })

  return NextResponse.json({ bills })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, amount, dueDate, recurring } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Bill name is required' }, { status: 400 })
  }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
  }
  if (!dueDate) {
    return NextResponse.json({ error: 'Due date is required' }, { status: 400 })
  }

  const bill = await prisma.bill.create({
    data: {
      userId: session.userId,
      name: name.trim(),
      amount: Number(amount),
      dueDate: new Date(dueDate),
      recurring: Boolean(recurring),
    },
  })

  return NextResponse.json({ bill }, { status: 201 })
}
