'use client'

import { LoadingState } from '@/components/shared/LoadingState'
import { DefaultValues } from '@/constants/constants'
import { useToast } from '@/lib/contexts/ToastContext'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { useSessionRefresh } from '@/lib/hooks/useSessionRefresh'
import {
  getBetByUserId,
  saveUserBet,
  updateGroupIdForUserBet,
} from '@/services/brazuerao.service'
import {
  createNewBetGroup,
  deleteBetGroup,
  getBetGroupsByUserId,
  getCurrentRequestByBetGroup,
  getUserInfo,
  joinBetGroup,
  updateBetGroup,
  updateUserBetGroup,
  updateUserInfo,
} from '@/services/user.service'
import { UserBetAPIResponse, UserProfile } from '@/types'
import { CurrentRequestBetGroup, UserBetGroup } from '@/types/domain'
import { signOut, useSession } from 'next-auth/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuthContextType {
  // State
  user: UserProfile | null
  userGroups: UserBetGroup[]
  userBets: UserBetAPIResponse[]
  isLoading: boolean
  isAuthenticated: boolean

  // User Actions
  updateProfile: (name: string) => Promise<boolean>

  // Group Actions
  createNewGroup: (params: CreateGroupParams) => Promise<UserBetGroup | null>
  updateGroupInfo: (params: UpdateGroupParams) => Promise<UserBetGroup | null>
  deleteGroup: (groupId: string) => Promise<boolean>
  joinGroup: (groupId: string) => Promise<boolean>

  // Request Management
  getCurrentRequests: (groupId: string) => Promise<CurrentRequestBetGroup[]>
  handleCurrentRequest: (
    userId: string,
    groupId: string,
    statusId: string
  ) => Promise<CurrentRequestBetGroup | null>

  // Bet Actions
  saveMyBet: (predictions: string[], groupId: string | null) => Promise<boolean>
}

interface CreateGroupParams {
  name: string
  challenge?: string | null
  isPrivate: boolean
  deadlineAt: Date
  allowPublicViewing: boolean
  rules: string[]
}

interface UpdateGroupParams {
  groupId: string
  name: string
  challenge?: string | null
  deadlineAt: Date
  isPrivate: boolean
  allowPublicViewing: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ERROR_MESSAGES = {
  FETCH_USER: 'Falha ao obter dados do usuário.',
  FETCH_USER_DATA: 'Falha ao obter os dados do usuário.',
  UPDATE_USER: 'Falha ao atualizar os dados do usuário.',
  EMPTY_NAME: 'Nome não pode estar vazio.',
  CREATE_GROUP: 'Falha ao criar novo grupo.',
  UPDATE_GROUP: 'Falha ao atualizar as informações do grupo.',
  DELETE_GROUP: 'Falha ao deletar o grupo.',
  JOIN_GROUP: 'Falha ao incluir no grupo.',
  FETCH_REQUESTS: 'Falha ao obter dados dos participantes do grupo.',
  HANDLE_REQUEST: 'Falha ao processar solicitação.',
  SAVE_BET: 'Falha ao salvar a aposta.',
} as const

const SUCCESS_MESSAGES = {
  UPDATE_USER: 'Dados do usuário atualizados com sucesso.',
  CREATE_GROUP: 'Novo grupo criado com sucesso.',
  UPDATE_GROUP: 'Atualização feita com sucesso.',
  DELETE_GROUP: 'Grupo deletado com sucesso.',
  JOIN_GROUP: 'Inclusão no grupo feita com sucesso.',
  HANDLE_REQUEST: 'Ação realizada com sucesso.',
  SAVE_BET: 'Aposta salva com sucesso.',
} as const

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const { showToast } = useToast()
  const { refreshSession } = useSessionRefresh()
  const { isAuthenticated } = useRequireAuth()

  // State
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userGroups, setUserGroups] = useState<UserBetGroup[]>([])
  const [userBets, setUserBets] = useState<UserBetAPIResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ============================================================================
  // AUTHENTICATION HANDLING
  // ============================================================================

  /**
   * Handle authentication status changes
   * No redirect - let individual pages handle their own protection
   */
  useEffect(() => {
    // Wait for session to be determined
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (status === 'unauthenticated') {
      // Clear state but don't redirect
      setUser(null)
      setUserGroups([])
      setUserBets([])
      setIsLoading(false)
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status])

  /**
   * Fetch user groups and bets when user changes
   */
  useEffect(() => {
    if (user) {
      fetchUserData()
    } else {
      setUserGroups([])
      setUserBets([])
    }
  }, [user?.id])

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch authenticated user's profile
   */
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const userInfo = await getUserInfo()
      setUser(userInfo)
    } catch (err) {
      handleError(err, ERROR_MESSAGES.FETCH_USER)
      setUser(null)
      await signOut()
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch user-specific data (groups and bets)
   */
  const fetchUserData = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)

      const [groups, bets] = await Promise.all([
        getBetGroupsByUserId(),
        getBetByUserId(),
      ])

      setUserGroups(groups)
      setUserBets(bets)
    } catch (err) {
      handleError(err, ERROR_MESSAGES.FETCH_USER_DATA)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // ============================================================================
  // USER ACTIONS
  // ============================================================================

  /**
   * Update user profile name
   */
  const updateProfile = useCallback(
    async (name: string): Promise<boolean> => {
      const trimmedName = name.trim()

      if (!trimmedName) {
        showToast({
          type: 'error',
          message: ERROR_MESSAGES.EMPTY_NAME,
        })
        return false
      }

      try {
        setIsLoading(true)

        const updatedUserInfo = await updateUserInfo(trimmedName)
        setUser(updatedUserInfo)

        await refreshSession({
          name: updatedUserInfo.name,
        })

        showToast({
          type: 'success',
          message: SUCCESS_MESSAGES.UPDATE_USER,
        })

        return true
      } catch (err) {
        handleError(err, ERROR_MESSAGES.UPDATE_USER)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [refreshSession, showToast]
  )

  // ============================================================================
  // GROUP ACTIONS
  // ============================================================================

  /**
   * Create a new bet group
   */
  const createNewGroup = useCallback(
    async (params: CreateGroupParams): Promise<UserBetGroup | null> => {
      try {
        setIsLoading(true)

        const {
          name,
          challenge,
          isPrivate,
          deadlineAt,
          allowPublicViewing,
          rules,
        } = params

        const newGroup = await createNewBetGroup(
          name,
          challenge,
          isPrivate,
          deadlineAt,
          allowPublicViewing,
          rules
        )

        setUserGroups((prev) => [...prev, newGroup])

        showToast({
          type: 'success',
          message: SUCCESS_MESSAGES.CREATE_GROUP,
        })

        return newGroup
      } catch (err) {
        handleError(err, ERROR_MESSAGES.CREATE_GROUP)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [userBets, showToast]
  )

  /**
   * Update existing group information
   */
  const updateGroupInfo = useCallback(
    async (params: UpdateGroupParams): Promise<UserBetGroup | null> => {
      try {
        setIsLoading(true)

        const {
          groupId,
          name,
          challenge,
          deadlineAt,
          isPrivate,
          allowPublicViewing,
        } = params

        const updatedGroup = await updateBetGroup(
          groupId,
          name,
          challenge,
          deadlineAt,
          isPrivate,
          allowPublicViewing
        )

        setUserGroups((prev) =>
          prev.map((group) =>
            group.groupId === groupId ? updatedGroup : group
          )
        )

        showToast({
          type: 'success',
          message: SUCCESS_MESSAGES.UPDATE_GROUP,
        })

        return updatedGroup
      } catch (err) {
        handleError(err, ERROR_MESSAGES.UPDATE_GROUP)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [showToast]
  )

  /**
   * Delete a bet group
   */
  const deleteGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      try {
        setIsLoading(true)

        await deleteBetGroup(groupId)

        setUserGroups((prev) =>
          prev.filter((group) => group.groupId !== groupId)
        )

        showToast({
          type: 'success',
          message: SUCCESS_MESSAGES.DELETE_GROUP,
        })

        return true
      } catch (err) {
        handleError(err, ERROR_MESSAGES.DELETE_GROUP)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [showToast]
  )

  /**
   * Join an existing bet group
   */
  const joinGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      try {
        setIsLoading(true)

        const newGroup = await joinBetGroup(groupId)

        setUserGroups((prev) => [...prev, newGroup])

        showToast({
          type: 'success',
          message: SUCCESS_MESSAGES.JOIN_GROUP,
        })

        return true
      } catch (err) {
        handleError(err, ERROR_MESSAGES.JOIN_GROUP)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [showToast]
  )

  // ============================================================================
  // REQUEST MANAGEMENT
  // ============================================================================

  /**
   * Get current join requests for a group
   */
  const getCurrentRequests = useCallback(
    async (groupId: string): Promise<CurrentRequestBetGroup[]> => {
      try {
        return await getCurrentRequestByBetGroup(groupId)
      } catch (err) {
        handleError(err, ERROR_MESSAGES.FETCH_REQUESTS)
        return []
      }
    },
    []
  )

  /**
   * Handle a group join request (approve/reject)
   */
  const handleCurrentRequest = useCallback(
    async (
      userId: string,
      groupId: string,
      statusId: string
    ): Promise<CurrentRequestBetGroup | null> => {
      try {
        const updatedInfo = await updateUserBetGroup(userId, groupId, statusId)

        // If request approved, assign default bet to group
        if (statusId === DefaultValues.approvedRequestStatus?.id) {
          await assignDefaultBetToGroup(groupId)
        }

        showToast({
          type: 'success',
          message: SUCCESS_MESSAGES.HANDLE_REQUEST,
        })

        return updatedInfo
      } catch (err) {
        handleError(err, ERROR_MESSAGES.HANDLE_REQUEST)
        return null
      }
    },
    [userBets, showToast]
  )

  // ============================================================================
  // BET ACTIONS
  // ============================================================================

  /**
   * Save user bet predictions
   */
  const saveMyBet = useCallback(
    async (predictions: string[], groupId: string | null): Promise<boolean> => {
      try {
        setIsLoading(true)

        const savedUserBet = await saveUserBet(predictions, groupId)

        if (savedUserBet) {
          setUserBets([
            ...userBets.filter(
              (bet) => bet.groupId && bet.groupId !== savedUserBet.id
            ),
            savedUserBet,
          ])

          showToast({
            type: 'success',
            message: SUCCESS_MESSAGES.SAVE_BET,
          })
          return true
        } else {
          showToast({
            type: 'error',
            message: ERROR_MESSAGES.SAVE_BET,
          })
        }

        return false
      } catch (err) {
        handleError(err, ERROR_MESSAGES.SAVE_BET)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [showToast]
  )

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Assign default bet (without group) to a specific group
   */
  const assignDefaultBetToGroup = async (groupId: string): Promise<void> => {
    const defaultBet = userBets.find((bet) => !bet.groupId)

    if (!defaultBet) return

    try {
      const updatedBet = await updateGroupIdForUserBet(groupId)

      setUserBets((prev) =>
        prev.map((bet) => (bet.id === defaultBet.id ? updatedBet : bet))
      )
    } catch (err) {
      // Non-critical error, log but don't show to user
      console.error('Failed to assign default bet to group:', err)
    }
  }

  /**
   * Centralized error handling
   */
  const handleError = (err: unknown, defaultMessage: string): void => {
    const errorMessage = err instanceof Error ? err.message : defaultMessage

    showToast({
      type: 'error',
      message: errorMessage,
    })

    // Log for debugging
    console.error('[AuthContext]', defaultMessage, err)
  }

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      userGroups,
      userBets,
      isLoading,
      isAuthenticated,
      updateProfile,
      createNewGroup,
      updateGroupInfo,
      deleteGroup,
      joinGroup,
      getCurrentRequests,
      handleCurrentRequest,
      saveMyBet,
    }),
    [
      user,
      userGroups,
      userBets,
      isLoading,
      isAuthenticated,
      updateProfile,
      createNewGroup,
      updateGroupInfo,
      deleteGroup,
      joinGroup,
      getCurrentRequests,
      handleCurrentRequest,
      saveMyBet,
    ]
  )

  if (isLoading) return <LoadingState message="Carregando..." />

  return (
    <AuthContext.Provider value={contextValue}>
      {isAuthenticated ? children : null}
    </AuthContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access authentication context
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
