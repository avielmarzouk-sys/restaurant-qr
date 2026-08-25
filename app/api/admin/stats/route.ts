import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'
import { SUBSCRIPTION_PRICE } from '@/app/lib/subscription'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [totalRestaurants, activeRestaurants, recentRestaurants] = await Promise.all([
      prisma.restaurant.count(),

      prisma.restaurant.count({ where: { isActive: true } }),

      prisma.restaurant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return Response.json({
      totalRestaurants,
      activeRestaurants,
      subscriptionRevenue: activeRestaurants * SUBSCRIPTION_PRICE,
      recentRestaurants,
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}