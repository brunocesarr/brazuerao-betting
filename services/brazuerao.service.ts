import { appBrazuerao } from '@/repositories/apiBrazuerao'
import {
  getIndividualUserScore,
  getBrazilianLeague,
} from '@/repositories/brazuerao.repository'

async function getUserScore(classification: string[]) {
  return await getIndividualUserScore(classification)
}

async function getCurrentBrazilianLeague(
  year: number = new Date().getFullYear()
) {
  return await getBrazilianLeague(year)
}

export { getUserScore, getCurrentBrazilianLeague }
