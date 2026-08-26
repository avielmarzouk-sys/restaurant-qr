import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

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
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { nameHe, nameEn, nameFr } = await req.json()
    if (!nameHe) return Response.json({ error: 'שם הקטגוריה בעברית חובה' }, { status: 400 })

    const restaurantId = session.restaurantId as string

    const count = await prisma.category.count({ where: { restaurantId } })

    const category = await prisma.category.create({
      data: {
        restaurantId,
        nameHe,
        nameEn: nameEn || null,
        nameFr: nameFr || null,
        position: count,
      },
    })

    return Response.json(category)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
