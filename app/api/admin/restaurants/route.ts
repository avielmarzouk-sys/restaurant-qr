import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'
import { sendWelcomeEmail } from '@/app/lib/email'
import bcrypt from 'bcryptjs'

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'restaurant'
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
      include: { users: { include: { user: true } } },
    })

    return Response.json(restaurants)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { name, ownerEmail, ownerPassword, ownerName, primaryColor } = await req.json()

    if (!name || !ownerEmail || !ownerPassword) {
      return Response.json({ error: 'Champs manquants' }, { status: 400 })
    }

    let slug = slugify(name)
    const existing = await prisma.restaurant.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
    }

    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } })
    if (existingUser) {
      return Response.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 10)

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        primaryColor: primaryColor || '#FF6B35',
        users: {
          create: {
            role: 'OWNER',
            user: {
              create: {
                email: ownerEmail,
                password: hashedPassword,
                name: ownerName || name,
                role: 'RESTAURANT_USER',
              },
            },
          },
        },
      },
    })

    await sendWelcomeEmail({
      to: ownerEmail,
      ownerName: ownerName || name,
      restaurantName: name,
      tempPassword: ownerPassword,
    })

    return Response.json(restaurant)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}