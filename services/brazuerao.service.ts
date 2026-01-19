import {
  getIndividualUserScore,
  getBrazilianLeague,
  getAllBetRules,
  getBetByUserId,
  saveUserBet,
} from '@/repositories/brazuerao.repository'

async function getUserScore(classification: string[]) {
  return await getIndividualUserScore(classification)
}

async function getCurrentBrazilianLeague(
  year: number = new Date().getFullYear()
) {
  return await getBrazilianLeague(year)
}

async function getBrazueraoBetRules() {
  return await getAllBetRules()
}

async function getCurrentBet() {
  return await getBetByUserId()
}

async function saveUserPredictions(
  predictions: string[],
  season: number = new Date().getFullYear()
) {
  return await saveUserBet(predictions, season)
}

export {
  getUserScore,
  getCurrentBrazilianLeague,
  getBrazueraoBetRules,
  getCurrentBet,
  saveUserPredictions,
}
