import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const user = token ? await getUserFromToken(token) : null
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
}