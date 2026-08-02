import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

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
      where: { product: { categoryId: id } },
    })

    await prisma.productOption.deleteMany({
      where: { product: { categoryId: id } },
    })

    await prisma.product.deleteMany({
      where: { categoryId: id },
    })

    await prisma.category.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}