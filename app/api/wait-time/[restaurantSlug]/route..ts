import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantSlug: string }> }
) {
  try {
    const { restaurantSlug } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      select: { id: true },
    })

    if (!restaurant) {
      return Response.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const activeOrders = await prisma.order.count({
      where: {
        restaurantId: restaurant.id,
        status: { in: ['NEW', 'ACCEPTED', 'PREPARING'] },
      },
    })

    const estimatedMinutes = Math.min(45, Math.max(10, 10 + activeOrders * 4))

    return Response.json({ estimatedMinutes, activeOrders })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}