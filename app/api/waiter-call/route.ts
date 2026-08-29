import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { restaurantId, tableId } = await req.json()
    if (!restaurantId || !tableId) {
      return Response.json({ error: 'Missing restaurantId or tableId' }, { status: 400 })
    }

    const call = await prisma.waiterCall.create({
      data: { restaurantId, tableId, status: 'PENDING' },
    })

    return Response.json(call)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const calls = await prisma.waiterCall.findMany({
      where: { restaurantId: session.restaurantId as string, status: 'PENDING' },
      include: { table: true },
      orderBy: { createdAt: 'asc' },
    })

    return Response.json(calls)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}