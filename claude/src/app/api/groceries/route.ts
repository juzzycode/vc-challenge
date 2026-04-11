import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = { userId: session.userId }
  if (category) where.category = category
  if (status === 'purchased') where.purchased = true
  else if (status === 'active') where.purchased = false

  const items = await prisma.groceryItem.findMany({
    where,
    orderBy: [{ purchased: 'asc' }, { category: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, category } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
  }

  const item = await prisma.groceryItem.create({
    data: {
      userId: session.userId,
      name: name.trim(),
      category: category || 'other',
    },
  })

  return NextResponse.json({ item }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const clearPurchased = searchParams.get('clearPurchased')

  if (clearPurchased === 'true') {
    await prisma.groceryItem.deleteMany({
      where: { userId: session.userId, purchased: true },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
