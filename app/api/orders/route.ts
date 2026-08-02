import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { restaurantId: session.restaurantId as string },
      include: {
        table: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return Response.json(orders)
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { restaurantId, tableId, items, totalAmount, customerNote } = await req.json()

    const lastOrder = await prisma.order.findFirst({
      where: { restaurantId },
      orderBy: { orderNumber: 'desc' },
    })

    const orderNumber = (lastOrder?.orderNumber || 0) + 1

    const order = await prisma.order.create({
      data: {
        restaurantId,
        tableId,
        orderNumber,
        totalAmount,
        customerNote,
        status: 'NEW',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            selectedOptions: item.selectedOptions,
          })),
        },
      },
      include: { items: true, table: true },
    })

    return Response.json(order)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const restaurantId = session.restaurantId as string

    await prisma.orderItem.deleteMany({
      where: {
        order: {
          restaurantId,
          status: { in: ['DONE', 'CANCELLED'] },
        },
      },
    })

    await prisma.order.deleteMany({
      where: {
        restaurantId,
        status: { in: ['DONE', 'CANCELLED'] },
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}