import { safePost } from '@/lib/api/safe-axios'
import {
  getErrorMessage,
  ValidationError,
  withAPIErrorHandling,
} from '@/lib/errors'
import { appBrazuerao } from '@/repositories/apiBrazuerao'
import { CurrentRequestBetGroup, UserBetGroup } from '@/types/domain'

const API_SOURCE = 'Brazuerao API'

/**
 * Fetches current user info from the Brazuerão API
 */
async function getUserInfo() {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/user')
    return data
  }, `${API_SOURCE}/user`)
}

/**
 * Updates current user info from the Brazuerão API
 */
async function updateUserInfo(name: string) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.patch('/user', {
      name,
    })
    return data
  }, `${API_SOURCE}/user`)
}

/**
 * Fetches user's current groups from the Brazuerão API
 */
async function getBetGroupsByUserId() {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get('/user/groups')
    return data.groups as UserBetGroup[]
  }, `${API_SOURCE}/user/groups`)
}

/**
 * Create new group from the Brazuerão API
 */
async function createNewBetGroup(
  name: string,
  challenge: string | null | undefined,
  isPrivate: boolean,
  deadlineAt: Date,
  allowPublicViewing: boolean,
  rules: string[]
) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.post('/user/groups', {
      name,
      challenge,
      isPrivate,
      deadlineAt,
      allowPublicViewing,
      rules,
    })
    return data as UserBetGroup
  }, `${API_SOURCE}/user/groups`)
}

/**
 * Create new group from the Brazuerão API
 */
async function deleteBetGroup(groupId: string) {
  return withAPIErrorHandling(async () => {
    await appBrazuerao.delete(`/user/groups/${groupId}`)
  }, `${API_SOURCE}/user/groups/${groupId}`)
}

/**
 * Join group from the Brazuerão API
 */
async function joinBetGroup(groupId: string) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.post(`/user/groups/${groupId}`)
    return data as UserBetGroup
  }, `${API_SOURCE}/user/groups/${groupId}`)
}

/**
 * Join group from the Brazuerão API
 */
async function updateBetGroup(
  groupId: string,
  name: string,
  challenge: string | null | undefined,
  deadlineAt: Date,
  isPrivate: boolean,
  allowPublicViewing: boolean
) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.patch(`/user/groups/${groupId}`, {
      name,
      challenge,
      deadlineAt,
      isPrivate,
      allowPublicViewing,
    })
    return data as UserBetGroup
  }, `${API_SOURCE}/user/groups/${groupId}`)
}

/**
 * Fetch current requests for group from the Brazuerão API
 */
async function getCurrentRequestByBetGroup(groupId: string) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.get(`/user/groups/${groupId}/requests`)
    return data.requests as CurrentRequestBetGroup[]
  }, `${API_SOURCE}/user/groups/${groupId}/requests`)
}

/**
 * Updates user bet group from the Brazuerão API
 */
async function updateUserBetGroup(
  userId: string,
  groupId: string,
  statusId: string
) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.patch(
      `/user/groups/${groupId}/requests`,
      {
        userId,
        statusId,
      }
    )
    return data.request as CurrentRequestBetGroup | null
  }, `${API_SOURCE}/user/groups/${groupId}/requests`)
}

/**
 * Create new user from the Brazuerão API
 */
async function createNewUser(name: string, email: string, password: string) {
  try {
    const { data } = await safePost(appBrazuerao, '/register', {
      name,
      email,
      password,
    })
    return { ok: true, data }
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        ok: false,
        error: error.message,
        fieldErrors: error.fieldErrors,
      }
    }

    return {
      ok: false,
      error: getErrorMessage(error),
    }
  }
}

export {
  createNewBetGroup,
  createNewUser,
  deleteBetGroup,
  getBetGroupsByUserId,
  getCurrentRequestByBetGroup,
  getUserInfo,
  joinBetGroup,
  updateBetGroup,
  updateUserBetGroup,
  updateUserInfo,
}
