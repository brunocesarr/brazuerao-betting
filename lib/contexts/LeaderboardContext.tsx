'use client'

import {
  getAllBetRules,
  getIndividualUserScore,
  getLeaderboardGroups,
  getScoreForLeaderboardGroup,
} from '@/services/brazuerao.service'
import {
  LeaderboardEntry,
  RuleBet,
  ScoreEntry,
  UserBetGroup,
} from '@/types/domain'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'

interface LeaderboardContextType {
  rules: RuleBet[]
  groups: UserBetGroup[]
  myUserScore: ScoreEntry[]
  leaderboard: LeaderboardEntry[]
  selectedGroup: string
  username?: string | null
  loading: boolean
  onChangeSelectedGroup: (groupId: string) => void
  getRuleByRuleId: (ruleId: string) => RuleBet | undefined
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(
  undefined
)

export function LeaderboardProvider({
  children,
}: {
  children: React.ReactNode
}) {
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
    if (status === 'loading') return

    try {
      setLoading(true)

      const [userGroups, rulesData] = await Promise.all([
        getLeaderboardGroups(),
        getAllBetRules(),
      ])

      if (status === 'authenticated') {
        const userScore = await getIndividualUserScore()
        setMyUserScore(userScore[0].score)
      }

      setGroups(userGroups)
      setRules(rulesData)

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
    if (status === 'loading') return

    try {
      setLoading(true)
      const leaderboard = await getScoreForLeaderboardGroup(selectedGroup)
      setLeaderboard(leaderboard)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRuleByRuleId = (ruleId: string): RuleBet | undefined => {
    return rules.find((rule: RuleBet) => rule.id === ruleId)
  }

  return (
    <LeaderboardContext.Provider
      value={{
        myUserScore,
        rules,
        groups,
        leaderboard,
        selectedGroup,
        loading,
        getRuleByRuleId,
        username: session?.user.name,
        onChangeSelectedGroup: setSelectedGroup,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  )
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext)
  if (!context) {
    throw new Error('useLeaderboard must be used')
  }
  return context
}
