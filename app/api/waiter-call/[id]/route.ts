import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const call = await prisma.waiterCall.updateMany({
      where: { id, restaurantId: session.restaurantId as string },
      data: { status: 'DONE' },
    })

    if (call.count === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}