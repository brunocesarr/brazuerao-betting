'use client'

import { BetGroupSelectSimple } from '@/components/betting/BetGroupSelect'
import { EmptyState } from '@/components/leaderboard/EmptyState'
import { InfoCard } from '@/components/leaderboard/InfoCard'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { PageHeader } from '@/components/leaderboard/PageHeader'
import { SummaryCards } from '@/components/leaderboard/SummaryCards'
import { LoadingState } from '@/components/shared/LoadingState'
import { useLeaderboard } from '@/lib/contexts/LeaderboardContext'
import { useState } from 'react'

export default function LeaderboardPage() {
  const {
    myUserScore,
    username,
    groups,
    rules,
    leaderboard,
    selectedGroup,
    loading,
    onChangeSelectedGroup,
    getRuleByRuleId,
  } = useLeaderboard()

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (userId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedRows(newExpanded)
  }

  if (loading && leaderboard.length === 0) {
    return <LoadingState message="Carregando scores..." />
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <PageHeader
          title="Minha Pontuação"
          description="Acompanhe seu desempenho e veja como está se saindo no grupo"
        />

        <SummaryCards stats={myUserScore} rules={rules} />

        {leaderboard.length > 0 ? (
          <div className="space-y-4">
            <hr className="my-8 h-px border-0 bg-primary-700/50" />

            {groups.length > 1 && (
              <BetGroupSelectSimple
                groups={groups}
                onValueChange={onChangeSelectedGroup}
                value={selectedGroup}
              />
            )}

            <PageHeader
              title={`Grupo: ${groups.find((group) => group.groupId === selectedGroup)?.name}`}
              description="Acompanhe seu desempenho e dos demais integrantes"
            />

            <LeaderboardTable
              leaderboard={leaderboard}
              expandedRows={expandedRows}
              selectedGroup={selectedGroup}
              currentUsername={username}
              onToggleRow={toggleRow}
              getRuleByRuleId={getRuleByRuleId}
            />
          </div>
        ) : (
          <EmptyState />
        )}

        <InfoCard rules={rules} />
      </div>
    </div>
  )
}
