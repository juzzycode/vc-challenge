import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { tasks, groceryItems, bills, maintenanceItems } = body

    const results = { tasks: 0, groceryItems: 0, bills: 0, maintenanceItems: 0 }

    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        await prisma.task.create({
          data: {
            userId: session.userId,
            name: task.name || 'Imported Task',
            description: task.description || null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            recurrence: task.recurrence || 'none',
            completed: Boolean(task.completed),
            completedAt: task.completedAt ? new Date(task.completedAt) : null,
          },
        })
        results.tasks++
      }
    }

    if (Array.isArray(groceryItems)) {
      for (const item of groceryItems) {
        await prisma.groceryItem.create({
          data: {
            userId: session.userId,
            name: item.name || 'Imported Item',
            category: item.category || 'other',
            purchased: Boolean(item.purchased),
          },
        })
        results.groceryItems++
      }
    }

    if (Array.isArray(bills)) {
      for (const bill of bills) {
        if (!bill.name || !bill.amount || !bill.dueDate) continue
        await prisma.bill.create({
          data: {
            userId: session.userId,
            name: bill.name,
            amount: Number(bill.amount),
            dueDate: new Date(bill.dueDate),
            recurring: Boolean(bill.recurring),
            paid: Boolean(bill.paid),
            paidAt: bill.paidAt ? new Date(bill.paidAt) : null,
          },
        })
        results.bills++
      }
    }

    if (Array.isArray(maintenanceItems)) {
      for (const item of maintenanceItems) {
        if (!item.name || !item.frequencyDays) continue
        await prisma.maintenanceItem.create({
          data: {
            userId: session.userId,
            name: item.name,
            lastCompleted: item.lastCompleted ? new Date(item.lastCompleted) : null,
            frequencyDays: Number(item.frequencyDays),
            notes: item.notes || null,
          },
        })
        results.maintenanceItems++
      }
    }

    return NextResponse.json({ success: true, imported: results })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Invalid import data' }, { status: 400 })
  }
}
