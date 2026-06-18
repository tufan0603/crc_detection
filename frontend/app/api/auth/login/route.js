import { NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'

export async function POST(req) {
  try {
    const { username, password } = await req.json()

    const validUser = process.env.ADMIN_USERNAME || 'admin'
    const validPass = process.env.ADMIN_PASSWORD || 'admin123'

    if (username !== validUser || password !== validPass) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const token = await createSession(username)
    const res = NextResponse.json({ success: true })

    res.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return res
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
