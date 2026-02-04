import { DefaultValues, RequestStatusEnum } from '@/constants/constants'
import { LocalStorageKeysCache } from '@/constants/local-storage.constants'
import { withAPIErrorHandling } from '@/lib/errors'
import { appBrazuerao } from '@/repositories/apiBrazuerao'
import localStorageService from '@/services/local-storage.service'
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
  const cacheRules = localStorageService.getItem<TeamPositionAPIResponse[]>(
    `${LocalStorageKeysCache.GET_STANDINGS}_${year ?? new Date().getFullYear()}`
  )
  if (cacheRules && cacheRules.length > 0) return cacheRules

  return withAPIErrorHandling(async () => {
    const targetYear = year ?? new Date().getFullYear()
    const { data } = await appBrazuerao.get(`/standings/${targetYear}`)
    const teams = (data?.data ?? []).map(mapTeamPositionData)
    localStorageService.setItem<TeamPositionAPIResponse[]>(
      `${LocalStorageKeysCache.GET_STANDINGS}_${year ?? new Date().getFullYear()}`,
      teams
    )
    return teams
  }, `${API_SOURCE}/standings`)
}

/**
 * Fetches all active scoring rules
 */
async function getAllBetRules(): Promise<RuleBet[]> {
  const cacheRules = localStorageService.getItem<RuleBet[]>(
    LocalStorageKeysCache.GET_ALL_RULES
  )
  if (cacheRules && cacheRules.length > 0) return cacheRules

  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/rules')
    localStorageService.setItem<RuleBet[]>(
      LocalStorageKeysCache.GET_ALL_RULES,
      data?.rules
    )
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
  const cacheBetGroups = localStorageService.getItem<UserBetGroup[]>(
    LocalStorageKeysCache.GET_ALL_BET_GROUPS
  )
  if (cacheBetGroups && cacheBetGroups.length > 0) return cacheBetGroups

  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/groups')
    localStorageService.setItem<UserBetGroup[]>(
      LocalStorageKeysCache.GET_ALL_BET_GROUPS,
      data
    )
    return data.groups
  }, `${API_SOURCE}/groups`)
}

/**
 * Fetches current group roles from the Brazuerão API
 */
async function getAllGroupRoles(): Promise<GroupRole[]> {
  const cacheGroupRoles = localStorageService.getItem<GroupRole[]>(
    LocalStorageKeysCache.GET_ALL_BET_GROUP_ROLES
  )
  if (cacheGroupRoles && cacheGroupRoles.length > 0) {
    updateDefaultRoleValues(cacheGroupRoles)
    return cacheGroupRoles
  }

  return withAPIErrorHandling(async () => {
    if (DefaultValues.groupRoles.length > 0) {
      updateDefaultRoleValues(DefaultValues.groupRoles)
      return DefaultValues.groupRoles
    }
    const { data } = await appBrazuerao.get('/groups/roles')
    updateDefaultRoleValues(data.roles)
    localStorageService.setItem<GroupRole[]>(
      LocalStorageKeysCache.GET_ALL_BET_GROUP_ROLES,
      DefaultValues.groupRoles
    )
    return data.roles
  }, `${API_SOURCE}/groups/roles`)
}

function updateDefaultRoleValues(roles: GroupRole[]) {
  DefaultValues.groupRoles = roles
  DefaultValues.adminGroupRule = roles.find(
    (rule: GroupRole) => rule.name.toUpperCase() === 'ADMIN'
  )
}

/**
 * Fetches current request status from the Brazuerão API
 */
async function getAllRequestStatus(): Promise<RequestStatus[]> {
  const cacheRequestStatus = localStorageService.getItem<RequestStatus[]>(
    LocalStorageKeysCache.GET_ALL_REQUEST_STATUS
  )
  if (cacheRequestStatus && cacheRequestStatus.length > 0) {
    updateDefaultRequestStatus(cacheRequestStatus)
    return cacheRequestStatus
  }

  return withAPIErrorHandling(async () => {
    if (DefaultValues.requestStatus.length > 0) {
      updateDefaultRequestStatus(DefaultValues.requestStatus)
      return DefaultValues.requestStatus
    }
    const { data } = await appBrazuerao.get('/groups/request-status')
    updateDefaultRequestStatus(data.requestStatus)
    localStorageService.setItem<RequestStatus[]>(
      LocalStorageKeysCache.GET_ALL_REQUEST_STATUS,
      DefaultValues.requestStatus
    )
    return data.requestStatus
  }, `${API_SOURCE}/groups/request-status`)
}

function updateDefaultRequestStatus(requestStatus: RequestStatus[]) {
  DefaultValues.requestStatus = requestStatus
  DefaultValues.pendingRequestStatus = requestStatus.find(
    (status: RequestStatus) => status.status === RequestStatusEnum.pending
  )
  DefaultValues.approvedRequestStatus = requestStatus.find(
    (status: RequestStatus) => status.status === RequestStatusEnum.approved
  )
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
