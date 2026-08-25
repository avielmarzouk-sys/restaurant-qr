import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalRestaurants,
      activeRestaurants,
      todayOrders,
      todayRevenueData,
      recentRestaurants,
    ] = await Promise.all([
      prisma.restaurant.count(),

      prisma.restaurant.count({ where: { isActive: true } }),

      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),

      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),

      prisma.restaurant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return Response.json({
      totalRestaurants,
      activeRestaurants,
      todayOrders,
      todayRevenue: Math.round(todayRevenueData._sum.totalAmount || 0),
      recentRestaurants,
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}