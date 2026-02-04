import { forgotPasswordSchema } from '@/lib/validations/auth.schema'
import { sendPasswordResetEmail } from '@/services/email.service'
import { createPasswordResetToken } from '@/services/password-reset.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues
            .map((issue) => issue.message)
            .join(';'),
        },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Create reset token
    const result = await createPasswordResetToken(email)

    if (result.success && result.token) {
      // Send email
      await sendPasswordResetEmail(result.email!, result.name!, result.token)
    }

    // Always return success (security - don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message:
        'Se o email existir, você receberá instruções para resetar sua senha.',
    })
  } catch (error) {
    console.error('[API] Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
