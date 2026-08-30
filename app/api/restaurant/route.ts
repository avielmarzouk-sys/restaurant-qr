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
  bgColor: true,
  textColor: true,
  cardBgColor: true,
  cardBorderColor: true,
  buttonTextColor: true,
  showWaiterCall: true,
  showSearch: true,
  showFeatured: true,
  welcomeMessageHe: true,
  welcomeMessageEn: true,
  welcomeMessageFr: true,
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
    if (['SERIF', 'SANS', 'ROUNDED', 'ELEGANT', 'BOLD'].includes(body.fontStyle)) data.fontStyle = body.fontStyle
    if (['COMPACT', 'GRID', 'MAGAZINE', 'MINIMAL'].includes(body.layoutStyle)) data.layoutStyle = body.layoutStyle
    if (['ROUNDED', 'SHARP'].includes(body.cornerStyle)) data.cornerStyle = body.cornerStyle
    if (typeof body.tagline === 'string' || body.tagline === null) data.tagline = body.tagline || null
    if (typeof body.instagramUrl === 'string' || body.instagramUrl === null) data.instagramUrl = body.instagramUrl || null
    if (typeof body.facebookUrl === 'string' || body.facebookUrl === null) data.facebookUrl = body.facebookUrl || null
    if (typeof body.openingHours === 'string' || body.openingHours === null) data.openingHours = body.openingHours || null
    if (['he', 'en', 'fr'].includes(body.defaultLanguage)) data.defaultLanguage = body.defaultLanguage

    // Couleurs avancées : chaîne = couleur choisie, null = retour à la couleur par défaut du thème
    if (typeof body.bgColor === 'string' || body.bgColor === null) data.bgColor = body.bgColor || null
    if (typeof body.textColor === 'string' || body.textColor === null) data.textColor = body.textColor || null
    if (typeof body.cardBgColor === 'string' || body.cardBgColor === null) data.cardBgColor = body.cardBgColor || null
    if (typeof body.cardBorderColor === 'string' || body.cardBorderColor === null) data.cardBorderColor = body.cardBorderColor || null
    if (typeof body.buttonTextColor === 'string' || body.buttonTextColor === null) data.buttonTextColor = body.buttonTextColor || null

    // Sections activables/désactivables sur la page client
    if (typeof body.showWaiterCall === 'boolean') data.showWaiterCall = body.showWaiterCall
    if (typeof body.showSearch === 'boolean') data.showSearch = body.showSearch
    if (typeof body.showFeatured === 'boolean') data.showFeatured = body.showFeatured

    // Message d'accueil personnalisé (par langue)
    if (typeof body.welcomeMessageHe === 'string' || body.welcomeMessageHe === null) data.welcomeMessageHe = body.welcomeMessageHe || null
    if (typeof body.welcomeMessageEn === 'string' || body.welcomeMessageEn === null) data.welcomeMessageEn = body.welcomeMessageEn || null
    if (typeof body.welcomeMessageFr === 'string' || body.welcomeMessageFr === null) data.welcomeMessageFr = body.welcomeMessageFr || null

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