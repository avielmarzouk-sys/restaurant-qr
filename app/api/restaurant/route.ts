import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.restaurantId as string },
      select: { slug: true, name: true },
    })

    if (!restaurant) return Response.json({ error: 'Not found' }, { status: 404 })

    return Response.json(restaurant)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
