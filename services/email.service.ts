import { Resend } from 'resend'

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================
const transporter = new Resend(process.env.RESEND_API_KEY)

// ============================================================================
// EMAIL FUNCTIONS
// ============================================================================

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
) {
  try {
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    const textContent = `
Olá ${name},

Recebemos uma solicitação para resetar sua senha no Brazuerao.

Para criar uma nova senha, clique no link abaixo:
${resetLink}

Este link expira em 1 hora e pode ser usado apenas uma vez.

Se você não solicitou esta recuperação, ignore este email.

Atenciosamente,
Equipe Brazuerao
  `.trim()

    await transporter.emails.send({
      from: `"Brazuerao" <${process.env.SMTP_FROM}>`,
      to,
      subject: 'Recuperação de Senha - Brazuerao',
      text: textContent,
    })

    return { success: true }
  } catch (error) {
    console.error('[Email] Send error:', error)
    return {
      success: false,
      error: 'Falha ao enviar email',
    }
  }
}
