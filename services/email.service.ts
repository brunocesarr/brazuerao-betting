import nodemailer from 'nodemailer'

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
})

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
<html lang="pt-BR"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #00695f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #1a1a1a;">
    <tbody><tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header with gradient -->
          <tbody><tr>
            <td style="background: linear-gradient(135deg, #00695f 0%, #009688 100%); padding: 40px 40px 50px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🔐 Brazuerão
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Recuperação de Senha
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px; color: #333333; font-size: 18px; font-weight: 600;">
                Olá, ${name}!
              </p>
              
              <!-- Message -->
              <p style="margin: 0 0 24px; color: #666666; font-size: 15px; line-height: 1.6;">
                Recebemos uma solicitação para resetar a senha da sua conta no <strong>Brazuerão</strong>.
              </p>

              <p style="margin: 0 0 32px; color: #666666; font-size: 15px; line-height: 1.6;">
                Clique no botão abaixo para criar uma nova senha:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tbody><tr>
                  <td align="center" style="padding: 0 0 32px;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00695f 0%, #009688 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                      Resetar Minha Senha
                    </a>
                  </td>
                </tr>
              </tbody></table>

              <!-- Alternative link -->
              <p style="margin: 0 0 24px; color: #999999; font-size: 13px; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>
              
              <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 12px 16px; margin: 0 0 32px; word-break: break-all;">
                <a href="${resetLink}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                  ${resetLink}
                </a>
              </div>

              <!-- Security info box -->
              <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 16px; margin: 0 0 24px; border-radius: 4px;">
                <p style="margin: 0 0 8px; color: #856404; font-size: 14px; font-weight: 600;">
                  ⚠️ Informações Importantes
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 13px; line-height: 1.6;">
                  <li>Este link expira em <strong>1 hora</strong></li>
                  <li>Pode ser usado apenas <strong>uma vez</strong></li>
                  <li>Se você não solicitou esta recuperação, ignore este email</li>
                </ul>
              </div>

              <!-- Security tip -->
              <div style="border-top: 1px solid #009688; padding-top: 24px;">
                <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                  <strong>Dica de segurança:</strong> Nunca compartilhe sua senha com ninguém. Nossa equipe nunca solicitará sua senha por email.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #009688; padding: 30px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #ffffff; font-size: 13px;">
                Atenciosamente,<br>
                <strong style="color: #ffffff;">Equipe Brazuerão</strong>
              </p>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 12px;">
                © ${new Date().getFullYear()} Brazuerão. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </tbody></table>

        <!-- Footer note -->
        <p style="margin: 20px 0 0; color: #999999; font-size: 12px; text-align: center; max-width: 600px;">
          Você recebeu este email porque uma recuperação de senha foi solicitada para sua conta.
        </p>

      </td>
    </tr>
  </tbody></table>

</body></html>
  `.trim()

    await transporter.sendMail({
      from: `"Brazuerao" <${process.env.SMTP_FROM}>`,
      to,
      subject: 'Recuperação de Senha - Brazuerao',
      html: textContent,
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
