import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  let season = new Date().getFullYear()
  const seasonParam = searchParams.get('season')
  if (seasonParam != null) {
    season = parseInt(seasonParam)
  }

  try {
    const bet = await prisma.bet.findUnique({
      where: {
        userId_season: {
          userId: session.user.id,
          season,
        },
      },
    })
    const formattedBet = bet
      ? {
          ...bet,
          predictions:
            typeof bet.predictions === 'string'
              ? JSON.parse(bet.predictions)
              : bet.predictions,
        }
      : null

    return NextResponse.json({ bet: formattedBet })
  } catch (error) {
    return NextResponse.json(
      { error: 'Falha ao buscar aposta' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { predictions, season } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const bet = await prisma.bet.upsert({
      where: {
        userId_season: {
          userId: user.id,
          season,
        },
      },
      update: {
        predictions: predictions,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        predictions: predictions,
        season,
      },
    })
    return NextResponse.json({ bet })
  } catch (error) {
    console.error('Error saving bet:', error)
    return NextResponse.json(
      { error: 'Falha ao salvar aposta' },
      { status: 500 }
    )
  }
}
