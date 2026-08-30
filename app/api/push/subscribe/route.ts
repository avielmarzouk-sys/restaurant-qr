import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { orderId, subscription, lang, pageUrl } = await req.json()

    if (!orderId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return Response.json({ error: 'Données invalides' }, { status: 400 })
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { orderId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, lang: lang || 'he', pageUrl: pageUrl || null },
      create: {
        orderId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        lang: lang || 'he',
        pageUrl: pageUrl || null,
      },
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}