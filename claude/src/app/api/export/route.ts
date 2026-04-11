import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [tasks, groceryItems, bills, maintenanceItems, user] = await Promise.all([
    prisma.task.findMany({ where: { userId: session.userId } }),
    prisma.groceryItem.findMany({ where: { userId: session.userId } }),
    prisma.bill.findMany({ where: { userId: session.userId } }),
    prisma.maintenanceItem.findMany({ where: { userId: session.userId } }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    tasks,
    groceryItems,
    bills,
    maintenanceItems,
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="household-data-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
