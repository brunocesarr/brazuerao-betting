'use client'

import { useToast } from '@/lib/contexts/ToastContext'
import { useSessionRefresh } from '@/lib/hooks/useSessionRefresh'
import {
  createNewBetGroup,
  deleteBetGroup,
  getBetGroupsByUserId,
  getUserInfo,
  joinBetGroup,
  updateUserInfo,
} from '@/services/user.service'
import { UserProfile as User } from '@/types'
import { UserBetGroup } from '@/types/domain'
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
  isLoading: boolean
  updateProfile: (name: string) => Promise<boolean>
  createNewGroup: (
    name: string,
    challenge: string | null | undefined,
    isPrivate: boolean,
    allowPublicViewing: boolean,
    rules: string[]
  ) => Promise<boolean>
  deleteGroup: (groupId: string) => Promise<boolean>
  joinGroup: (groupId: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status } = useSession()
  const { showToast } = useToast()
  const { refreshSession } = useSessionRefresh()

  const [user, setUser] = useState<User | null>(null)
  const [userGroups, setUserGroups] = useState<UserBetGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      setUser(null)
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        setIsLoading(true)
        if (!user) {
          setUserGroups([])
          return
        }
        const groups = await getBetGroupsByUserId()
        setUserGroups(groups)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Falha ao obter os grupos do usuário.'
        showToast({
          type: 'error',
          message: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserGroups()
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
    allowPublicViewing: boolean,
    rules: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true)

      const newGroup = await createNewBetGroup(
        name,
        challenge,
        isPrivate,
        allowPublicViewing,
        rules
      )
      setUserGroups([...userGroups, newGroup])
      showToast({
        type: 'success',
        message: 'Novo grupo criado com sucesso.',
      })

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Falha ao criar novo grupo.'
      showToast({
        type: 'error',
        message: errorMessage,
      })
      return false
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

  return (
    <AuthContext.Provider
      value={{
        user,
        userGroups,
        isLoading,
        updateProfile,
        createNewGroup,
        deleteGroup,
        joinGroup,
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
