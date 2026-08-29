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
    if (typeof body.descHe === 'string' || body.descHe === null) data.descHe = body.descHe || null
    if (body.price !== undefined) data.price = parseFloat(body.price)
    if (typeof body.image === 'string' || body.image === null) data.image = body.image || null
    if (typeof body.isAvailable === 'boolean') data.isAvailable = body.isAvailable
    if (typeof body.isFeatured === 'boolean') data.isFeatured = body.isFeatured
    if (typeof body.categoryId === 'string') data.categoryId = body.categoryId
    if (typeof body.position === 'number') data.position = body.position

    const product = await prisma.product.update({ where: { id }, data })

    return Response.json(product)
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
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.orderItem.deleteMany({
      where: { productId: id },
    })

    await prisma.productOption.deleteMany({
      where: { productId: id },
    })

    await prisma.product.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}