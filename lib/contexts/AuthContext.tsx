'use client'

import { DefaultValues } from '@/constants/constants'
import { useToast } from '@/lib/contexts/ToastContext'
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
import { UserProfile as User, UserBetAPIResponse } from '@/types'
import { CurrentRequestBetGroup, UserBetGroup } from '@/types/domain'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

interface AuthContextType {
  user: User | null
  userGroups: UserBetGroup[]
  userBets: UserBetAPIResponse[]
  isLoading: boolean
  updateProfile: (name: string) => Promise<boolean>
  createNewGroup: (
    name: string,
    challenge: string | null | undefined,
    isPrivate: boolean,
    deadlineAt: Date,
    allowPublicViewing: boolean,
    rules: string[]
  ) => Promise<UserBetGroup | null>
  updateGroupInfo: (
    groupId: string,
    name: string,
    challenge: string | null | undefined,
    deadlineAt: Date,
    isPrivate: boolean,
    allowPublicViewing: boolean
  ) => Promise<UserBetGroup | null>
  deleteGroup: (groupId: string) => Promise<boolean>
  joinGroup: (groupId: string) => Promise<boolean>
  getCurrentRequests: (groupId: string) => Promise<CurrentRequestBetGroup[]>
  handleCurrentRequest: (
    userId: string,
    groupId: string,
    statusId: string
  ) => Promise<CurrentRequestBetGroup | null>
  saveMyBet: (predictions: string[], groupId: string | null) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status } = useSession()
  const { showToast } = useToast()
  const { refreshSession } = useSessionRefresh()

  const [user, setUser] = useState<User | null>(null)
  const [userGroups, setUserGroups] = useState<UserBetGroup[]>([])
  const [userBets, setUserBets] = useState<UserBetAPIResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      setUser(null)
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  useEffect(() => {
    const fetchUserInfos = async () => {
      try {
        setIsLoading(true)
        if (!user) {
          setUserGroups([])
          setUserBets([])
          return
        }
        const [groups, bets] = await Promise.all([
          getBetGroupsByUserId(),
          getBetByUserId(),
        ])

        setUserGroups(groups)
        setUserBets(bets)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Falha ao obter os dados do usuário.'
        showToast({
          type: 'error',
          message: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfos()
  }, [user])

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const userInfo = await getUserInfo()
      setUser(userInfo)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Falha ao obter dados do usuário.'
      showToast({
        type: 'error',
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  const updateProfile = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        setIsLoading(true)

        const updatedUserInfo = await updateUserInfo(name)
        setUser(updatedUserInfo)
        await refreshSession({
          name: updatedUserInfo.name,
        })
        showToast({
          type: 'success',
          message: 'Dados do usuário atualizado com sucesso.',
        })

        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Falha ao atualizar os dados do usuário.'
        showToast({
          type: 'error',
          message: errorMessage,
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [showToast]
  )

  const createNewGroup = async (
    name: string,
    challenge: string | null | undefined,
    isPrivate: boolean,
    deadlineAt: Date,
    allowPublicViewing: boolean,
    rules: string[]
  ): Promise<UserBetGroup | null> => {
    try {
      setIsLoading(true)

      const newGroup = await createNewBetGroup(
        name,
        challenge,
        isPrivate,
        deadlineAt,
        allowPublicViewing,
        rules
      )
      setUserGroups([...userGroups, newGroup])

      let defaultGroupId = userBets.find((userBet) => !userBet.groupId)?.id
      if (defaultGroupId) {
        const updatedBet = await updateGroupIdForUserBet(newGroup.groupId)
        setUserBets([
          ...userBets.filter((userBet) => userBet.id !== defaultGroupId),
          updatedBet,
        ])
      }

      showToast({
        type: 'success',
        message: 'Novo grupo criado com sucesso.',
      })

      return newGroup
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Falha ao criar novo grupo.'
      showToast({
        type: 'error',
        message: errorMessage,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteGroup = async (groupId: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      await deleteBetGroup(groupId)
      setUserGroups([
        ...userGroups.filter((group) => group.groupId !== groupId),
      ])
      showToast({
        type: 'success',
        message: 'Grupo deletado com sucesso.',
      })

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Falha ao deletar o grupo.'
      showToast({
        type: 'error',
        message: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const joinGroup = async (groupId: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const newGroup = await joinBetGroup(groupId)
      setUserGroups([...userGroups, newGroup])
      showToast({
        type: 'success',
        message: 'Inclusao no grupo feita com sucesso.',
      })

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Falha ao incluir no grupo.'
      showToast({
        type: 'error',
        message: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateGroupInfo = async (
    groupId: string,
    name: string,
    challenge: string | null | undefined,
    deadlineAt: Date,
    isPrivate: boolean,
    allowPublicViewing: boolean
  ): Promise<UserBetGroup | null> => {
    try {
      setIsLoading(true)

      const updatedGroup = await updateBetGroup(
        groupId,
        name,
        challenge,
        deadlineAt,
        isPrivate,
        allowPublicViewing
      )
      setUserGroups([
        ...userGroups.filter((userGroup) => userGroup.groupId !== groupId),
        updatedGroup,
      ])
      showToast({
        type: 'success',
        message: 'Atualizacão feita com sucesso.',
      })

      return updatedGroup
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Falha ao atualizar as informacões do grupo.'
      showToast({
        type: 'error',
        message: errorMessage,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleCurrentRequest = async (
    userId: string,
    groupId: string,
    statusId: string
  ) => {
    try {
      const updatedInfo = await updateUserBetGroup(userId, groupId, statusId)

      let defaultGroupId = userBets.find((userBet) => !userBet.groupId)?.id
      if (
        defaultGroupId &&
        statusId === DefaultValues.approvedRequestStatus?.id
      ) {
        const updatedBet = await updateGroupIdForUserBet(groupId)
        setUserBets([
          ...userBets.filter((userBet) => userBet.id !== defaultGroupId),
          updatedBet,
        ])
      }

      showToast({
        type: 'success',
        message: 'Ação realizada com sucesso.',
      })
      return updatedInfo
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Falha ao obter dados dos particantes do grupo.'
      showToast({
        type: 'error',
        message: errorMessage,
      })
      return null
    }
  }

  const getCurrentRequests = async (groupId: string) => {
    try {
      return await getCurrentRequestByBetGroup(groupId)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Falha ao obter dados dos particantes do grupo.'
      showToast({
        type: 'error',
        message: errorMessage,
      })
      return []
    }
  }

  const saveMyBet = async (
    predictions: string[],
    groupId: string | null
  ): Promise<boolean> => {
    try {
      setIsLoading(true)

      const savedUserBet = await saveUserBet(predictions, groupId)
      if (savedUserBet) {
        const newUserBets = [
          ...userBets.filter((userBet) => userBet.id === savedUserBet.id),
          savedUserBet,
        ]
        setUserBets(newUserBets)
        showToast({
          type: 'success',
          message: 'Aposta salva com sucesso.',
        })
      }

      return true
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Falha ao salvar a aposta.',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userGroups,
        userBets,
        isLoading,
        updateProfile,
        createNewGroup,
        updateGroupInfo,
        deleteGroup,
        joinGroup,
        getCurrentRequests,
        handleCurrentRequest,
        saveMyBet,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
