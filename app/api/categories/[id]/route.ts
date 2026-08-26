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
    const body = await req.json()

    const data: any = {}
    if (typeof body.nameHe === 'string') data.nameHe = body.nameHe
    if (typeof body.nameEn === 'string' || body.nameEn === null) data.nameEn = body.nameEn || null
    if (typeof body.nameFr === 'string' || body.nameFr === null) data.nameFr = body.nameFr || null
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive
    if (typeof body.position === 'number') data.position = body.position

    const category = await prisma.category.update({ where: { id }, data })

    return Response.json(category)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const products = await prisma.product.findMany({ where: { categoryId: id }, select: { id: true } })
    const productIds = products.map(p => p.id)

    if (productIds.length > 0) {
      await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } })
      await prisma.productOption.deleteMany({ where: { productId: { in: productIds } } })
      await prisma.product.deleteMany({ where: { id: { in: productIds } } })
    }

    await prisma.category.delete({ where: { id } })

    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
