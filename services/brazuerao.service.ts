import { DefaultValues, RequestStatusEnum } from '@/constants/constants'
import { withAPIErrorHandling } from '@/lib/api-error'
import { appBrazuerao } from '@/repositories/apiBrazuerao'
import {
  TeamPositionAPIResponse,
  UserBetAPIResponse,
  UserScoreAPIResponse,
} from '@/types/api'
import {
  GroupRole,
  LeaderboardEntry,
  RequestStatus,
  RuleBet,
  UserBetGroup,
} from '@/types/domain'

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
    return data
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
async function getAllBetRules(): Promise<RuleBet[]> {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/rules')
    return (data?.rules ?? []) as RuleBet[]
  }, `${API_SOURCE}/rules`)
}

/**
 * Fetches user's current bet from the Brazuerão API
 */
async function getBetByUserId() {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/bets')
    return data?.bets as UserBetAPIResponse[]
  }, `${API_SOURCE}/bets`)
}

/**
 * Saves user's predictions to the Brazuerão API
 */
async function saveUserBet(predictions: string[], groupId: string | null) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.post('/bets', {
      groupId,
      predictions,
      season: new Date().getFullYear(),
    })
    return data?.bet as UserBetAPIResponse
  }, `${API_SOURCE}/bets`)
}

/**
 * Update groupId for default user's predictions to the Brazuerão API
 */
async function updateGroupIdForUserBet(groupId: string | null) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.patch('/bets', {
      groupId,
      season: new Date().getFullYear(),
    })
    return data?.bet as UserBetAPIResponse
  }, `${API_SOURCE}/bets`)
}

/**
 * Fetches current groups from the Brazuerão API
 */
async function getAllBetGroups(): Promise<UserBetGroup[]> {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/groups')
    return data.groups
  }, `${API_SOURCE}/groups`)
}

/**
 * Fetches current group roles from the Brazuerão API
 */
async function getAllGroupRoles(): Promise<GroupRole[]> {
  return withAPIErrorHandling(async () => {
    if (DefaultValues.groupRoles.length > 0) {
      DefaultValues.adminGroupRule = DefaultValues.groupRoles.find(
        (rule) => rule.name.toUpperCase() === 'ADMIN'
      )
      return DefaultValues.groupRoles
    }
    const { data } = await appBrazuerao.get('/groups/roles')
    DefaultValues.groupRoles = data.roles
    DefaultValues.adminGroupRule = data.roles.find(
      (rule: GroupRole) => rule.name.toUpperCase() === 'ADMIN'
    )
    return data.roles
  }, `${API_SOURCE}/groups/roles`)
}

/**
 * Fetches current request status from the Brazuerão API
 */
async function getAllRequestStatus(): Promise<RequestStatus[]> {
  return withAPIErrorHandling(async () => {
    if (DefaultValues.requestStatus.length > 0) {
      DefaultValues.pendingRequestStatus = DefaultValues.requestStatus.find(
        (status) => status.status === RequestStatusEnum.pending
      )
      DefaultValues.approvedRequestStatus = DefaultValues.requestStatus.find(
        (status) => status.status === RequestStatusEnum.approved
      )
      return DefaultValues.requestStatus
    }
    const { data } = await appBrazuerao.get('/groups/request-status')
    DefaultValues.requestStatus = data.requestStatus
    DefaultValues.pendingRequestStatus = data.requestStatus.find(
      (status: RequestStatus) => status.status === RequestStatusEnum.pending
    )
    DefaultValues.approvedRequestStatus = data.requestStatus.find(
      (status: RequestStatus) => status.status === RequestStatusEnum.approved
    )
    return data.requestStatus
  }, `${API_SOURCE}/groups/request-status`)
}

/**
 * Fetches current groups for leaderboard from the Brazuerão API
 */
async function getLeaderboardGroups(): Promise<UserBetGroup[]> {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/leaderboard')
    return data.groups
  }, `${API_SOURCE}/groups`)
}

/**
 * Fetches current groups for leaderboard from the Brazuerão API
 */
async function getScoreForLeaderboardGroup(
  groupId: string
): Promise<LeaderboardEntry[]> {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get(`/leaderboard/${groupId}`)
    return data
  }, `${API_SOURCE}/leaderboard/${groupId}`)
}

export {
  getAllBetGroups,
  getAllBetRules,
  getAllGroupRoles,
  getAllRequestStatus,
  getBetByUserId,
  getBrazilianLeague,
  getIndividualUserScore,
  getLeaderboardGroups,
  getScoreForLeaderboardGroup,
  saveUserBet,
  updateGroupIdForUserBet,
}
