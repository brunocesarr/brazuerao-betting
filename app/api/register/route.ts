import { createUser, existsUser } from '@/repositories/brazuerao.repository'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    const existingUser = await existsUser({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 400 }
      )
    }

    const user = await createUser(name, email, password)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json({ error: 'Falha no registro' }, { status: 500 })
  }
}
