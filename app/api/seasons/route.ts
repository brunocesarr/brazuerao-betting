import { NextResponse } from 'next/server'
import { fetchBrasileiraoSeasons } from '@/lib/sofascore'

export async function GET() {
  try {
    const seasons = await fetchBrasileiraoSeasons()

    const formattedSeasons = seasons
      .map((season) => ({
        year: parseInt(season.year),
        seasonId: season.id,
        name: season.name,
      }))
      .sort((a, b) => b.year - a.year)

    return NextResponse.json({
      success: true,
      data: formattedSeasons,
      count: formattedSeasons.length,
    })
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}
