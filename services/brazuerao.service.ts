import { withAPIErrorHandling } from '@/lib/api-error'
import { appBrazuerao } from '@/repositories/apiBrazuerao'
import {
  RulesAPIResponse,
  TeamPositionAPIResponse,
  UserScoreAPIResponse,
} from '@/types/api'

const API_SOURCE = 'Brazuerao API'

/**
 * Maps raw team position data from API to standardized response format
 */
function mapTeamPositionData(
  raw: Record<string, unknown>
): TeamPositionAPIResponse {
  return {
    position: raw.position as number,
    played: raw.played as number,
    name: raw.team as string,
    shield: raw.shield as string | undefined,
  }
}

/**
 * Fetches current user's score from the Brazuerão API
 */
async function getIndividualUserScore(): Promise<UserScoreAPIResponse[]> {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/score')
    return (data?.scoreByRule ?? []) as UserScoreAPIResponse[]
  }, `${API_SOURCE}/score`)
}

/**
 * Fetches Brazilian league standings for a given year
 */
async function getBrazilianLeague(
  year?: number
): Promise<TeamPositionAPIResponse[]> {
  return withAPIErrorHandling(async () => {
    const targetYear = year ?? new Date().getFullYear()
    const { data } = await appBrazuerao.get(`/standings/${targetYear}`)
    return (data?.data ?? []).map(mapTeamPositionData)
  }, `${API_SOURCE}/standings`)
}

/**
 * Fetches all active scoring rules
 */
async function getAllBetRules(): Promise<RulesAPIResponse[]> {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/rules')
    return (data?.rules ?? []) as RulesAPIResponse[]
  }, `${API_SOURCE}/rules`)
}

/**
 * Fetches user's current bet from the Brazuerão API
 */
async function getBetByUserId() {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/bets')
    return data?.bet
  }, `${API_SOURCE}/bets`)
}

/**
 * Saves user's predictions to the Brazuerão API
 */
async function saveUserBet(predictions: string[]) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.post('/bets', {
      predictions,
      season: new Date().getFullYear(),
    })
    return data?.bet
  }, `${API_SOURCE}/bets`)
}

export {
  getAllBetRules,
  getBetByUserId,
  getBrazilianLeague,
  getIndividualUserScore,
  saveUserBet,
}
