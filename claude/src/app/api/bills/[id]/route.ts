import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { addMonths } from '@/lib/utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bill = await prisma.bill.findFirst({
    where: { id: params.id, userId: session.userId },
  })
  if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const { name, amount, dueDate, recurring, paid } = body

  // If marking as paid and bill is recurring, create next month's instance
  if (paid === true && !bill.paid && bill.recurring) {
    const nextDue = addMonths(bill.dueDate, 1)
    await prisma.bill.create({
      data: {
        userId: session.userId,
        name: bill.name,
        amount: bill.amount,
        dueDate: nextDue,
        recurring: true,
      },
    })
  }

  const updated = await prisma.bill.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
      ...(recurring !== undefined && { recurring: Boolean(recurring) }),
      ...(paid !== undefined && {
        paid,
        paidAt: paid ? new Date() : null,
      }),
    },
  })

  return NextResponse.json({ bill: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bill = await prisma.bill.findFirst({
    where: { id: params.id, userId: session.userId },
  })
  if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.bill.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
