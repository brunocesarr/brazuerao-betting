import { fetchBrasileiraoSeasons } from '@/lib/sofascore'
import { SeasonsAPIResponse } from '@/types/api'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const seasons = await fetchBrasileiraoSeasons()

    const formattedSeasons = seasons
      .map((season) => ({
        year: parseInt(season.year),
        id: season.id,
        name: String(season.name),
      }))
      .sort((a, b) => b.year - a.year)

    return NextResponse.json({
      seasons: formattedSeasons,
    } as SeasonsAPIResponse)
  } catch (error) {
    console.error('Erro ao buscar temporadas:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar temporadas' },
      { status: 500 }
    )
  }
}
