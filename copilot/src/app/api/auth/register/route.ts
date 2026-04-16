import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    })
    const token = generateToken(user.id)
    const response = NextResponse.json({ message: 'Registered' })
    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}