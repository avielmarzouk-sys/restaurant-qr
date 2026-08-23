import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
  return NextResponse.redirect(new URL('/login', req.url))
}