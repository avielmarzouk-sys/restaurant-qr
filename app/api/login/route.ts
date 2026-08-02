import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { createToken } from '@/app/lib/auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurantUsers: {
          include: { restaurant: true },
        },
      },
    })

    if (!user) {
      return Response.json({ error: 'אימייל או סיסמה שגויים' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return Response.json({ error: 'אימייל או סיסמה שגויים' }, { status: 401 })
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantUsers[0]?.restaurantId || null,
      restaurantSlug: user.restaurantUsers[0]?.restaurant?.slug || null,
    })

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'שגיאה בשרת' }, { status: 500 })
  }
}