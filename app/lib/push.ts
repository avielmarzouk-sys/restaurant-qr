import webpush from 'web-push'
import { prisma } from '@/app/lib/prisma'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@click2eat.app'

let configured = false
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  configured = true
}

function getStatusMessage(status: string, lang: string) {
  const messages: Record<string, Record<string, string>> = {
    ACCEPTED: { he: '✓ ההזמנה שלך אושרה!', fr: '✓ Votre commande a été acceptée !', en: '✓ Your order was accepted!' },
    PREPARING: { he: '🔥 המנות שלך בהכנה!', fr: '🔥 Vos plats sont en préparation !', en: '🔥 Preparing your dishes!' },
    READY: { he: '🍽️ ההזמנה שלך מוכנה!', fr: '🍽️ Votre commande est prête !', en: '🍽️ Your order is ready!' },
    DONE: { he: '✓ תיאבון!', fr: '✓ Bon appétit !', en: '✓ Enjoy your meal!' },
    CANCELLED: { he: 'ההזמנה בוטלה', fr: 'Commande annulée', en: 'Order cancelled' },
  }
  const set = messages[status]
  if (!set) return null
  return { title: 'Click2Eat', body: set[lang] || set.he }
}

export async function sendPushForOrder(orderId: string, status: string) {
  if (!configured) return
  const fallback = getStatusMessage(status, 'he')
  if (!fallback) return

  try {
    const subs = await prisma.pushSubscription.findMany({ where: { orderId } })
    if (subs.length === 0) return

    await Promise.all(
      subs.map(async (sub) => {
        try {
          const message = getStatusMessage(status, sub.lang) || fallback
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({ ...message, url: sub.pageUrl || '/' })
          )
        } catch (err: any) {
          // abonnement expiré ou invalide : on le supprime pour ne plus réessayer
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
          }
        }
      })
    )
  } catch (err) {
    console.error('Push notification error', err)
  }
}