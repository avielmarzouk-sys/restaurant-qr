import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const restaurantId = session.restaurantId as string

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalOrders,
      totalRevenueData,
      todayOrders,
      todayRevenueData,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.count({ where: { restaurantId } }),

      prisma.order.aggregate({
        where: { restaurantId },
        _sum: { totalAmount: true },
      }),

      prisma.order.count({
        where: { restaurantId, createdAt: { gte: today } },
      }),

      prisma.order.aggregate({
        where: {
          restaurantId,
          createdAt: { gte: today },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),

      prisma.order.findMany({
        where: { restaurantId },
        include: { table: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      prisma.orderItem.groupBy({
        by: ['productName'],
        where: { order: { restaurantId } },
        _count: { productName: true },
        orderBy: { _count: { productName: 'desc' } },
        take: 5,
      }),
    ])

    const totalRevenue = totalRevenueData._sum.totalAmount || 0
    const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    return Response.json({
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      todayOrders,
      todayRevenue: Math.round(todayRevenueData._sum.totalAmount || 0),
      avgOrder,
      recentOrders,
      topProducts: topProducts.map(p => ({
        productName: p.productName,
        count: p._count.productName,
      })),
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}