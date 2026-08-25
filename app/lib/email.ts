import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Click2Eat <onboarding@resend.dev>'

export async function sendWelcomeEmail({
  to,
  ownerName,
  restaurantName,
  tempPassword,
}: {
  to: string
  ownerName: string
  restaurantName: string
  tempPassword: string
}) {
  const loginUrl = `${process.env.NEXTAUTH_URL || 'https://click2eat.vercel.app'}/login`

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Bienvenue sur Click2Eat, ${restaurantName} !`,
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f5; padding:32px 0;">
        <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e5e5;">
          <div style="background:#111111; padding:28px; text-align:center;">
            <span style="color:#FF6B35; font-size:24px; font-weight:800; letter-spacing:0.5px;">Click<span style="color:#ffffff;">2</span>Eat</span>
          </div>
          <div style="padding:32px;">
            <h1 style="font-size:20px; color:#111111; margin:0 0 16px;">Bienvenue, ${ownerName} 👋</h1>
            <p style="font-size:14px; color:#444444; line-height:1.6; margin:0 0 20px;">
              Le compte de <strong>${restaurantName}</strong> vient d'être créé sur Click2Eat.
              Vos clients peuvent désormais commander directement depuis leur téléphone en scannant le QR code de vos tables.
            </p>
            <div style="background:#fafafa; border:1px solid #eeeeee; border-radius:12px; padding:16px 20px; margin-bottom:24px;">
              <p style="font-size:13px; color:#888888; margin:0 0 4px;">Identifiants de connexion</p>
              <p style="font-size:14px; color:#111111; margin:0 0 2px;">Email&nbsp;: <strong>${to}</strong></p>
              <p style="font-size:14px; color:#111111; margin:0;">Mot de passe temporaire&nbsp;: <strong>${tempPassword}</strong></p>
            </div>
            <a href="${loginUrl}" style="display:inline-block; background:#FF6B35; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px; padding:12px 24px; border-radius:10px;">
              Accéder à mon tableau de bord
            </a>
            <p style="font-size:12px; color:#999999; margin-top:24px; line-height:1.5;">
              Par sécurité, pensez à changer ce mot de passe après votre première connexion.
            </p>
          </div>
        </div>
      </div>
      `,
    })

    if (error) {
      console.error('RESEND a refusé l\'envoi du mail de bienvenue:', error)
      return
    }

    console.log('Email de bienvenue envoyé avec succès, id Resend:', data?.id)
  } catch (error) {
    console.error('Erreur inattendue lors de l\'envoi du mail de bienvenue:', error)
  }
}