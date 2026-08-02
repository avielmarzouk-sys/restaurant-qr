import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, nameHe, price, type } = await req.json()

    const topping = await prisma.productOption.create({
      data: {
        productId,
        nameHe,
        price: price || 0,
        type: type || 'EXTRA',
      },
    })

    return Response.json(topping)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}