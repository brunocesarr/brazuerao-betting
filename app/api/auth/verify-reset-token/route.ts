import { verifyResetToken } from '@/services/password-reset.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token não fornecido' },
        { status: 400 }
      )
    }

    const result = await verifyResetToken(token)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Verify token error:', error)
    return NextResponse.json(
      { valid: false, message: 'Erro ao verificar token' },
      { status: 500 }
    )
  }
}
