import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantSlug: string }> }
) {
  try {
    const { restaurantSlug } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      include: {
        categories: {
          where: { isActive: true },
          include: {
            products: {
              where: { isAvailable: true },
              include: { options: true },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!restaurant) {
      return Response.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return Response.json(restaurant, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
