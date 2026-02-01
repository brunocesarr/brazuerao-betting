'use client'

import { BetGroupSelectSimple } from '@/components/betting/BetGroupSelect'
import { EmptyState } from '@/components/leaderboard/EmptyState'
import ExportGroupPDFDropdown from '@/components/leaderboard/ExportGroupPDFButton'
import { InfoCard } from '@/components/leaderboard/InfoCard'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { PageHeader } from '@/components/leaderboard/PageHeader'
import { SummaryCards } from '@/components/leaderboard/SummaryCards'
import { LoadingState } from '@/components/shared/LoadingState'
import { useLeaderboard } from '@/lib/contexts/LeaderboardContext'
import { useBetDeadline } from '@/lib/hooks/useBetDeadline'
import { RuleBet } from '@/types'
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

  const { deadline, isExpired } = useBetDeadline(selectedGroup, groups)
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

  const getRules = (): RuleBet[] => {
    if (!username) return rules.filter((rule) => rule.isDefault)
    const groupRules =
      leaderboard
        .find((details) => details.groupId === selectedGroup)
        ?.score.map((ruleScore) => ruleScore.ruleId) ?? []
    return rules.filter((rule) =>
      groupRules.some((groupRule) => groupRule === rule.id)
    )
  }

  if (loading && leaderboard.length === 0) {
    return <LoadingState message="Carregando scores..." />
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {username && (
          <>
            <PageHeader
              title="Minha Pontuação"
              description="Acompanhe seu desempenho e veja como está se saindo no grupo"
            />

            <SummaryCards stats={myUserScore} rules={rules} />
          </>
        )}

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

            <div className="flex flex-col items-end justify-end space-y-2">
              <ExportGroupPDFDropdown
                groupName={
                  groups.find((group) => group.groupId === selectedGroup)
                    ?.name ?? ''
                }
                deadline={deadline ? new Date(deadline) : new Date()}
                leaderboard={leaderboard}
                getRuleByRuleId={getRuleByRuleId}
                disabled={!isExpired}
              />
              {isExpired && (
                <p className="text-xs text-gray-400/80">
                  Funcão estará disponível após encerramento das apostas
                </p>
              )}
            </div>

            <InfoCard rules={getRules()} />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}
