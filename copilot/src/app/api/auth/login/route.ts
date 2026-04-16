import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const token = generateToken(user.id)
    const response = NextResponse.json({ message: 'Logged in' })
    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}