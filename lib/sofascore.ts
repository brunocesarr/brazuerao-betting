import { SeasonAPIResponse } from '@/types/api'

let cachedSeasons: SeasonAPIResponse[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

const URL_BASE_SOFASCORE =
  process.env.NEXT_PUBLIC_SOFASCORE_API_URL || 'https://api.sofascore.com/api'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function fetchSofaScore<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${URL_BASE_SOFASCORE}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
      'sec-ch-ua':
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    },
    next: { revalidate: 86400 }, // Cache for 24 hours (Next.js caching)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function fetchBrasileiraoSeasons(): Promise<SeasonAPIResponse[]> {
  // Check in-memory cache first
  if (
    cachedSeasons &&
    cachedSeasons.length > 0 &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedSeasons
  }

  try {
    const data = await fetchSofaScore<{ seasons: SeasonAPIResponse[] }>(
      '/v1/unique-tournament/325/seasons'
    )

    cachedSeasons = data.seasons
    cacheTimestamp = Date.now()

    return data.seasons
  } catch (error) {
    console.error('Error fetching seasons:', error)

    // Return stale cache if available
    if (cachedSeasons) {
      console.warn('Returning stale cache due to fetch error')
      return cachedSeasons
    }

    throw error
  }
}

export async function getSeasonIdByYear(year: number): Promise<number | null> {
  try {
    const seasons = await fetchBrasileiraoSeasons()
    const season = seasons.find((s) => parseInt(s.year) === year)
    return season ? season.id : null
  } catch (error) {
    console.error('Error getting season ID:', error)
    return null
  }
}

export async function getAvailableYears(): Promise<number[]> {
  try {
    const seasons = await fetchBrasileiraoSeasons()
    return seasons.map((s) => parseInt(s.year)).sort((a, b) => b - a)
  } catch (error) {
    console.error('Error getting available years:', error)
    return []
  }
}
