import { LeaderboardEntry } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UseLeaderboardDetailsParams {
  userId: string | null
  groupId: string | null
  leaderboard: LeaderboardEntry[]
}

export const useLeaderboardDetails = ({
  userId,
  groupId,
  leaderboard,
}: UseLeaderboardDetailsParams) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [scoreDetails, setScoreDetails] = useState<LeaderboardEntry>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !groupId) {
      router.replace('/leaderboard')
      return
    }

    loadScoreDetails()
  }, [userId, groupId, leaderboard])

  const loadScoreDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const score = leaderboard.find(
        (entry) => entry.userId === userId && entry.groupId === groupId
      )

      if (!score) {
        setError('Score details not found')
        router.replace('/leaderboard')
        return
      }

      setScoreDetails(score)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Failed to load score details:', err)
    } finally {
      setLoading(false)
    }
  }

  return { scoreDetails, loading, error }
}
