import { resetPasswordSchema } from '@/lib/validations/auth.schema'
import { resetPassword } from '@/services/password-reset.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = resetPasswordSchema.safeParse(body)

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

    const { token, password } = validation.data

    // Reset password
    const result = await resetPassword(token, password)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('[API] Reset password error:', error)
    return NextResponse.json(
      { error: 'Erro ao resetar senha' },
      { status: 500 }
    )
  }
}
