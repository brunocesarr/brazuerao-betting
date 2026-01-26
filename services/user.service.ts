import { withAPIErrorHandling } from '@/lib/api-error'
import { appBrazuerao } from '@/repositories/apiBrazuerao'
import { UserBetGroup } from '@/types/domain'

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
  allowPublicViewing: boolean,
  rules: string[]
) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.post('/user/groups', {
      name,
      challenge,
      isPrivate,
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
  }, `${API_SOURCE}/user/groups`)
}

/**
 * Join group from the Brazuerão API
 */
async function joinBetGroup(groupId: string) {
  return withAPIErrorHandling(async () => {
    const { data } = await appBrazuerao.post(`/user/groups/${groupId}`)
    return data as UserBetGroup
  }, `${API_SOURCE}/user/groups`)
}

export {
  createNewBetGroup,
  deleteBetGroup,
  getBetGroupsByUserId,
  getUserInfo,
  joinBetGroup,
  updateUserInfo,
}
