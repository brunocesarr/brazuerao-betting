import { useToast } from '@/lib/contexts/ToastContext'
import { useSessionRefresh } from '@/lib/hooks/useSessionRefresh'
import { UserProfile as User } from '@/types'
import { useCallback, useEffect, useState } from 'react'

interface UseProfileReturn {
  user: User | null
  userGroups: any[]
  isLoading: boolean
  isUpdating: boolean
  fetchProfile: () => Promise<void>
  updateProfile: (name: string) => Promise<boolean>
}

export function useProfile(): UseProfileReturn {
  const [user, setUser] = useState<User | null>(null)
  const [userGroups, setUserGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { showToast } = useToast()
  const { refreshSession } = useSessionRefresh()

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        setIsLoading(true)

        if (!user) {
          setUserGroups([])
          return
        }

        const response = await fetch('/api/groups')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch profile')
        }

        setUserGroups(data.private)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch user groups'
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

      const response = await fetch('/api/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile')
      }

      setUser(data.user)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch profile'
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
        setIsUpdating(true)

        const response = await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update profile')
        }

        setUser(result.user)
        await refreshSession({
          name: result.user.name,
        })
        showToast({
          type: 'success',
          message: result.message || 'Profile updated successfully',
        })

        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update profile'
        showToast({
          type: 'error',
          message: errorMessage,
        })
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [showToast]
  )

  return {
    user,
    userGroups,
    isLoading,
    isUpdating,
    fetchProfile,
    updateProfile,
  }
}
