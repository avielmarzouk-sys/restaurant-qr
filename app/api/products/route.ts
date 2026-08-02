import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { restaurantId: session.restaurantId as string },
      include: {
        products: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    })

    return Response.json(categories)
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { categoryId, nameHe, nameEn, nameRu, descHe, price, image } = await req.json()

    const product = await prisma.product.create({
      data: {
        restaurantId: session.restaurantId as string,
        categoryId,
        nameHe,
        nameEn,
        nameRu,
        descHe,
        price,
        image,
      },
    })

    return Response.json(product)
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}