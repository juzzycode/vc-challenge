import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.maintenanceItem.findFirst({
    where: { id: params.id, userId: session.userId },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const { name, lastCompleted, frequencyDays, notes, markDoneNow } = body

  const updated = await prisma.maintenanceItem.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      ...(frequencyDays !== undefined && { frequencyDays: Number(frequencyDays) }),
      ...(lastCompleted !== undefined && {
        lastCompleted: lastCompleted ? new Date(lastCompleted) : null,
      }),
      ...(markDoneNow === true && { lastCompleted: new Date() }),
    },
  })

  return NextResponse.json({ item: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.maintenanceItem.findFirst({
    where: { id: params.id, userId: session.userId },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.maintenanceItem.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
