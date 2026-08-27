import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

const SELECT = {
  slug: true,
  name: true,
  logo: true,
  coverImage: true,
  theme: true,
  fontStyle: true,
  layoutStyle: true,
  cornerStyle: true,
  tagline: true,
  instagramUrl: true,
  facebookUrl: true,
  openingHours: true,
  primaryColor: true,
  defaultLanguage: true,
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.restaurantId as string },
      select: SELECT,
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
    if (['COMPACT', 'GRID', 'MAGAZINE'].includes(body.layoutStyle)) data.layoutStyle = body.layoutStyle
    if (['ROUNDED', 'SHARP'].includes(body.cornerStyle)) data.cornerStyle = body.cornerStyle
    if (typeof body.tagline === 'string' || body.tagline === null) data.tagline = body.tagline || null
    if (typeof body.instagramUrl === 'string' || body.instagramUrl === null) data.instagramUrl = body.instagramUrl || null
    if (typeof body.facebookUrl === 'string' || body.facebookUrl === null) data.facebookUrl = body.facebookUrl || null
    if (typeof body.openingHours === 'string' || body.openingHours === null) data.openingHours = body.openingHours || null
    if (['he', 'en', 'fr'].includes(body.defaultLanguage)) data.defaultLanguage = body.defaultLanguage

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data,
      select: SELECT,
    })

    return Response.json(restaurant)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}