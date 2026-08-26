import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { categoryId, nameHe, nameEn, nameFr, descHe, price, image } = await req.json()

    if (!categoryId || !nameHe || price === undefined || price === null) {
      return Response.json({ error: 'קטגוריה, שם בעברית ומחיר הם שדות חובה' }, { status: 400 })
    }

    const restaurantId = session.restaurantId as string

    const count = await prisma.product.count({ where: { categoryId } })

    const product = await prisma.product.create({
      data: {
        restaurantId,
        categoryId,
        nameHe,
        nameEn: nameEn || null,
        nameFr: nameFr || null,
        descHe: descHe || null,
        price: parseFloat(price),
        image: image || null,
        position: count,
      },
    })

    return Response.json(product)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
