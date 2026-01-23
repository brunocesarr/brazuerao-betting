import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

interface UpdateSessionData {
  name?: string
}

export function useSessionRefresh() {
  const { data: session, update } = useSession()

  const refreshSession = useCallback(
    async (data?: UpdateSessionData) => {
      if (!session) return null

      try {
        const updatedSession = await update(data)
        return updatedSession
      } catch (error) {
        console.error('Error refreshing session:', error)
        return null
      }
    },
    [session, update]
  )

  return {
    session,
    refreshSession,
  }
}
