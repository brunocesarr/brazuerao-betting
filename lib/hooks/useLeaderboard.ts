import {
  getAllBetGroups,
  getAllBetRules,
  getIndividualUserScore,
} from '@/services/brazuerao.service'
import { LeaderboardEntry, RuleBet } from '@/types'
import { ScoreEntry, UserBetGroup } from '@/types/domain'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export const useLeaderboard = () => {
  const { data: session, status } = useSession()
  const [myUserScore, setMyUserScore] = useState<ScoreEntry[]>([])
  const [rules, setRules] = useState<RuleBet[]>([])
  const [groups, setGroups] = useState<UserBetGroup[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadInitialData()
  }, [status])

  useEffect(() => {
    if (selectedGroup) {
      fetchLeaderboard()
    }
  }, [selectedGroup])

  const loadInitialData = async () => {
    if (status !== 'authenticated') return

    try {
      setLoading(true)
      const [userGroups, rulesData, userScore] = await Promise.all([
        getAllBetGroups(),
        getAllBetRules(),
        getIndividualUserScore(),
      ])

      setGroups(userGroups)
      setRules(rulesData)
      setMyUserScore(userScore)

      if (userGroups.length > 0) {
        setSelectedGroup(userGroups[0].groupId)
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    if (status !== 'authenticated' || !session) return

    try {
      setLoading(true)
      const score = await getIndividualUserScore()

      setLeaderboard([
        {
          userId: session.user.id ?? '',
          username: session.user.name ?? '',
          score: [...score],
        },
      ])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRuleTypeByRuleId = (ruleId: string): string | undefined => {
    return rules.find((rule) => rule.id === ruleId)?.ruleType
  }

  const toggleRow = (userId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedRows(newExpanded)
  }

  return {
    session,
    myUserScore,
    rules,
    groups,
    leaderboard,
    selectedGroup,
    loading,
    expandedRows,
    setSelectedGroup,
    toggleRow,
    getRuleTypeByRuleId,
  }
}
