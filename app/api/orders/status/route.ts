import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) return Response.json({ error: 'No orderId' }, { status: 400 })

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, orderNumber: true },
    })

    if (!order) return Response.json({ error: 'Not found' }, { status: 404 })

    return Response.json(order)
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}