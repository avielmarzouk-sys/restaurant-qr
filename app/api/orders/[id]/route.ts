import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'
import { sendPushForOrder } from '@/app/lib/push'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { status } = await req.json()

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    // Notification push best-effort : ne doit jamais faire échouer la mise à jour du statut
    sendPushForOrder(id, status).catch(() => {})

    return Response.json(order)
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}