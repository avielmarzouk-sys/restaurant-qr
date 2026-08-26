import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.restaurantId as string },
      select: {
        slug: true,
        name: true,
        logo: true,
        coverImage: true,
        theme: true,
        fontStyle: true,
        primaryColor: true,
        defaultLanguage: true,
      },
    })

    if (!restaurant) return Response.json({ error: 'Not found' }, { status: 404 })

    return Response.json(restaurant)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const restaurantId = session.restaurantId as string
    if (!restaurantId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const data: any = {}
    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if (typeof body.primaryColor === 'string') data.primaryColor = body.primaryColor
    if (typeof body.logo === 'string' || body.logo === null) data.logo = body.logo || null
    if (typeof body.coverImage === 'string' || body.coverImage === null) data.coverImage = body.coverImage || null
    if (body.theme === 'DARK' || body.theme === 'LIGHT') data.theme = body.theme
    if (['SERIF', 'SANS', 'ROUNDED'].includes(body.fontStyle)) data.fontStyle = body.fontStyle
    if (['he', 'en', 'fr'].includes(body.defaultLanguage)) data.defaultLanguage = body.defaultLanguage

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data,
      select: {
        slug: true,
        name: true,
        logo: true,
        coverImage: true,
        theme: true,
        fontStyle: true,
        primaryColor: true,
        defaultLanguage: true,
      },
    })

    return Response.json(restaurant)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}