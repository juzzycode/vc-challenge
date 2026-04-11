import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getNextRecurrence } from '@/lib/utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findFirst({
    where: { id: params.id, userId: session.userId },
  })

  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findFirst({
    where: { id: params.id, userId: session.userId },
  })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const { name, description, dueDate, recurrence, completed } = body

  // If completing a recurring task, create the next instance
  if (completed === true && !task.completed && task.recurrence && task.recurrence !== 'none' && task.dueDate) {
    const nextDate = getNextRecurrence(task.dueDate, task.recurrence)
    if (nextDate) {
      await prisma.task.create({
        data: {
          userId: session.userId,
          name: task.name,
          description: task.description,
          dueDate: nextDate,
          recurrence: task.recurrence,
        },
      })
    }
  }

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(recurrence !== undefined && { recurrence }),
      ...(completed !== undefined && {
        completed,
        completedAt: completed ? new Date() : null,
      }),
    },
  })

  return NextResponse.json({ task: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findFirst({
    where: { id: params.id, userId: session.userId },
  })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
