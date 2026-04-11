import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json({ tasks: [], groceries: [], bills: [], maintenance: [] })
  }

  const searchFilter = { contains: q }

  const [tasks, groceries, bills, maintenance] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: session.userId,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.groceryItem.findMany({
      where: {
        userId: session.userId,
        name: { contains: q },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.bill.findMany({
      where: {
        userId: session.userId,
        name: { contains: q },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    }),
    prisma.maintenanceItem.findMany({
      where: {
        userId: session.userId,
        OR: [
          { name: { contains: q } },
          { notes: { contains: q } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 20,
    }),
  ])

  return NextResponse.json({ tasks, groceries, bills, maintenance })
}
