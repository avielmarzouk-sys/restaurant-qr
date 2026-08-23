import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const tables = await prisma.table.findMany({
      where: { restaurantId: session.restaurantId as string },
      orderBy: { createdAt: 'asc' },
    })

    return Response.json({ tables, restaurantSlug: session.restaurantSlug as string | null })
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await req.json()

    const table = await prisma.table.create({
      data: {
        restaurantId: session.restaurantId as string,
        name,
      },
    })

    return Response.json(table)
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}