// Create a reusable hook
// hooks/use-bet-deadline.ts
import { UserBetGroup } from '@/types/domain'
import { useMemo } from 'react'

export function useBetDeadline(
  selectedGroupId: string | null,
  userGroups: UserBetGroup[]
) {
  return useMemo(() => {
    if (!selectedGroupId) {
      return { isExpired: false, deadline: null }
    }

    const group = userGroups.find((g) => g.groupId === selectedGroupId)
    if (!group) {
      return { isExpired: true, deadline: null }
    }

    const deadline = new Date(group.deadlineAt)
    const isExpired = deadline.getTime() <= new Date().getTime()

    return { isExpired, deadline }
  }, [selectedGroupId, userGroups])
}
