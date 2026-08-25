import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    const restaurant = await prisma.restaurant.findUnique({ where: { id } })
    if (!restaurant) {
      return Response.json({ error: 'Restaurant introuvable' }, { status: 404 })
    }

    const restaurantUsers = await prisma.restaurantUser.findMany({
      where: { restaurantId: id },
      select: { userId: true },
    })
    const userIds = restaurantUsers.map((ru) => ru.userId)

    const orders = await prisma.order.findMany({
      where: { restaurantId: id },
      select: { id: true },
    })
    const orderIds = orders.map((o) => o.id)

    const products = await prisma.product.findMany({
      where: { restaurantId: id },
      select: { id: true },
    })
    const productIds = products.map((p) => p.id)

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.productOption.deleteMany({ where: { productId: { in: productIds } } }),
      prisma.order.deleteMany({ where: { restaurantId: id } }),
      prisma.product.deleteMany({ where: { restaurantId: id } }),
      prisma.category.deleteMany({ where: { restaurantId: id } }),
      prisma.table.deleteMany({ where: { restaurantId: id } }),
      prisma.restaurantUser.deleteMany({ where: { restaurantId: id } }),
      prisma.restaurant.delete({ where: { id } }),
    ])

    if (userIds.length > 0) {
      const stillLinked = await prisma.restaurantUser.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true },
      })
      const stillLinkedIds = new Set(stillLinked.map((r) => r.userId))
      const orphanUserIds = userIds.filter((uid) => !stillLinkedIds.has(uid))

      if (orphanUserIds.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: orphanUserIds }, role: { not: 'SUPERADMIN' } },
        })
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}