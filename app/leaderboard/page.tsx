'use client'

import { EmptyState } from '@/components/leaderboard/EmptyState'
import { GroupSelector } from '@/components/leaderboard/GroupSelector'
import { InfoCard } from '@/components/leaderboard/InfoCard'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { PageHeader } from '@/components/leaderboard/PageHeader'
import { SummaryCards } from '@/components/leaderboard/SummaryCards'
import { LoadingState } from '@/components/shared/LoadingState'
import { useLeaderboard } from '@/lib/hooks/useLeaderboard'
import { useScoreCalculations } from '@/lib/hooks/useScoreCalculations'

export default function LeaderboardPage() {
  const {
    myUserScore,
    session,
    groups,
    rules,
    leaderboard,
    selectedGroup,
    loading,
    expandedRows,
    setSelectedGroup,
    toggleRow,
    getRuleTypeByRuleId,
  } = useLeaderboard()

  const stats = useScoreCalculations(leaderboard, getRuleTypeByRuleId)

  if (loading && leaderboard.length === 0) {
    return <LoadingState />
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
          <>
            <GroupSelector
              groups={groups}
              selectedGroup={selectedGroup}
              onChange={setSelectedGroup}
            />

            <LeaderboardTable
              leaderboard={leaderboard}
              stats={stats}
              expandedRows={expandedRows}
              selectedGroup={selectedGroup}
              currentUsername={session?.user?.name}
              onToggleRow={toggleRow}
              getRuleTypeByRuleId={getRuleTypeByRuleId}
            />
          </>
        ) : (
          <EmptyState />
        )}

        <InfoCard rules={rules} />
      </div>
    </div>
  )
}
