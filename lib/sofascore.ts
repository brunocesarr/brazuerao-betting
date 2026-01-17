import { Season } from '@/types'
import axios, { AxiosRequestConfig } from 'axios'

let cachedSeasons: Season[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

const URL_BASE_SOFASCORE = 'https://api.sofascore.com/api'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'

const defaultOptions: AxiosRequestConfig = {
  baseURL: URL_BASE_SOFASCORE,
  headers: {
    'Content-Type': 'application/json',
  },
}

const apiSofaScore = axios.create(defaultOptions)

apiSofaScore.interceptors.request.use(
  function (config) {
    config.headers.setUserAgent(USER_AGENT)
    return config
  },
  function (error) {
    console.error(JSON.stringify(error))
    return Promise.reject(error)
  }
)

export async function fetchBrasileiraoSeasons(): Promise<Season[]> {
  // Check if cache is still valid
  if (
    cachedSeasons &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedSeasons
  }

  try {
    const { data } = await apiSofaScore.get('/v1/unique-tournament/325/seasons')

    // Cache the results
    cachedSeasons = data.seasons
    cacheTimestamp = Date.now()

    return data.seasons
  } catch (error) {
    console.error('Error fetching seasons:', error)
    if (cachedSeasons) {
      return cachedSeasons
    }
    throw error
  }
}

export async function getSeasonIdByYear(year: number): Promise<number | null> {
  try {
    const seasons = await fetchBrasileiraoSeasons()
    const season = seasons.find((s) => s.year === year.toString())
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
