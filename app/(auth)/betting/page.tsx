'use client'

import { BetGroupSelectSimple } from '@/components/betting/BetGroupSelect'
import SortableTableRow from '@/components/betting/SortableTableRow'
import Checkbox from '@/components/shared/Checkbox'
import { LoadingState } from '@/components/shared/LoadingState'
import EmptyState from '@/components/user/groups/EmptyState'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useConfirmDialog } from '@/lib/contexts/DialogContext'
import { useToast } from '@/lib/contexts/ToastContext'
import { useBetDeadline } from '@/lib/hooks/useBetDeadline'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { getBrazilianLeagueByGloboEsporte } from '@/services/brazuerao.service'
import {
  TeamPositionAPIResponse,
  TeamPrediction,
  UserBetAPIResponse,
} from '@/types'
import { UserBetGroup } from '@/types/domain'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { DoorClosedLockedIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function BettingPage() {
  useRequireAuth()
  const { userBets, userGroups, isLoading: authLoading, saveMyBet } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirmDialog()
  const params = useSearchParams()

  const [savedPredictions, setSavedPredictions] = useState<TeamPrediction[]>([])
  const [predictions, setPredictions] = useState<TeamPrediction[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [saveForAll, setSaveForAll] = useState<boolean>(true)
  const [isLoadingBet, setIsLoadingBet] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const { isExpired, deadline } = useBetDeadline(selectedGroupId, userGroups)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const hasChanges = useMemo(() => {
    if (isExpired) return false
    if (savedPredictions.length === 0 && predictions.length > 0) return true
    return JSON.stringify(predictions) !== JSON.stringify(savedPredictions)
  }, [predictions, savedPredictions, isExpired])

  useEffect(() => {
    if (!authLoading && !isSaving) {
      initializeBettingData()
    }
  }, [userBets, userGroups, authLoading])

  useEffect(() => {
    if (!authLoading && !isSaving) {
      loadPredictions(selectedGroupId)
    }
  }, [selectedGroupId, authLoading])

  const initializeBettingData = useCallback(() => {
    const mostRecentBet = getMostRecentBet(userBets)
    const mostRecentGroup = getMostRecentGroup()
    const groupIdParam = params.get('groupId')
    const initialGroupId =
      groupIdParam ?? mostRecentBet?.groupId ?? mostRecentGroup?.groupId ?? null

    setSelectedGroupId(initialGroupId)
    setSaveForAll(!initialGroupId)
  }, [userBets])

  const getMostRecentBet = (
    bets: UserBetAPIResponse[]
  ): UserBetAPIResponse | null => {
    if (bets.length === 0) return null

    return [...bets].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0]
  }

  const getMostRecentGroup = (): UserBetGroup | null => {
    if (userGroups.length === 0) return null

    return [...userGroups].sort(
      (a, b) =>
        new Date(b.deadlineAt).getTime() - new Date(a.deadlineAt).getTime()
    )[0]
  }

  const loadPredictions = useCallback(
    async (groupId: string | null) => {
      try {
        setIsLoadingBet(true)

        const brazilianTable = await getBrazilianLeagueByGloboEsporte()
        const userBet = findUserBet(userBets, groupId)
        const predictions = createPredictions(brazilianTable, userBet)

        // Only show predictions if not expired OR if user already has a bet OR if saving for all
        const shouldShowPredictions =
          !isExpired || !!userBet || saveForAll || (!saveForAll && !groupId)

        setPredictions(shouldShowPredictions ? predictions : [])
        setSavedPredictions(userBet ? predictions : [])
      } catch (error) {
        console.error('Failed to load predictions:', error)
        showToast({
          message: 'Erro ao carregar previsões',
          type: 'error',
        })
        setPredictions([])
        setSavedPredictions([])
      } finally {
        setIsLoadingBet(false)
      }
    },
    [userBets, isExpired, saveForAll, showToast]
  )

  const findUserBet = (bets: UserBetAPIResponse[], groupId: string | null) => {
    return bets.find((bet) => bet.groupId === groupId)
  }

  const createPredictions = (
    brazilianTable: TeamPositionAPIResponse[],
    userBet?: UserBetAPIResponse
  ): TeamPrediction[] => {
    return brazilianTable
      .map((team: TeamPositionAPIResponse, index: number) => {
        let position = team.position

        if (userBet) {
          const predIndex = userBet.predictions.findIndex(
            (prediction) => prediction === team.name
          )
          if (predIndex !== -1) {
            position = predIndex + 1
          }
        }

        return {
          teamId: String(index),
          teamName: team.name,
          position,
          shieldUrl: team.shield,
        }
      })
      .sort((a, b) => a.position - b.position)
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (isExpired) return

      const { active, over } = event
      if (!over || active.id === over.id) return

      setPredictions((items) => {
        const oldIndex = items.findIndex((item) => item.teamId === active.id)
        const newIndex = items.findIndex((item) => item.teamId === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)

        return newItems.map((pred, idx) => ({
          ...pred,
          position: idx + 1,
        }))
      })
    },
    [isExpired]
  )

  const moveTeam = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (isExpired) return

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= predictions.length) return

      setPredictions((items) => {
        const newItems = [...items]
        ;[newItems[index], newItems[targetIndex]] = [
          newItems[targetIndex],
          newItems[index],
        ]

        return newItems.map((pred, idx) => ({
          ...pred,
          position: idx + 1,
        }))
      })
    },
    [predictions.length, isExpired]
  )

  const handleSubmit = async () => {
    if (!saveForAll && !selectedGroupId) {
      showToast({
        message: 'Por favor, selecione um grupo.',
        type: 'error',
      })
      return
    }
    const result = await confirm({
      title: saveForAll
        ? 'Atencão'
        : `Previsão: ${userGroups.find((userGroup) => userGroup.groupId === selectedGroupId)?.name}`,
      message: `Prosseguir com o salvamento da previsão? ${saveForAll ? '(Somente atualizará aqueles grupos em que está dentro do prazo de apostar)' : ''}`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'info',
    })

    if (!result) return

    try {
      setIsSaving(true)

      const success = await saveMyBet(
        predictions.map((p) => p.teamName),
        saveForAll ? null : selectedGroupId
      )

      if (success) {
        setSavedPredictions(predictions)
      }
    } catch (error) {
      console.error('Failed to save bet:', error)
      showToast({
        message: 'Erro ao salvar aposta',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectGroupId = useCallback((groupId: string) => {
    setSelectedGroupId(groupId)
    setSaveForAll(groupId.length === 0)
  }, [])

  const handleSelectSaveForAll = useCallback((save: boolean) => {
    setSaveForAll(save)
    if (save) {
      setSelectedGroupId(null)
    }
  }, [])

  const emptyStateByDeadlineExpired = () => {
    return userGroups.length <= 1 ? (
      <div className="from-primary-700 to-white bg-gradient-to-br p-4 rounded-xl text-white mb-8">
        <EmptyState
          icon={DoorClosedLockedIcon}
          title="Eita! Parece que você esqueceu de apostar..."
          description="Todos os grupos em que você está cadastrado já encerraram suas apostas."
        />
      </div>
    ) : (
      <div className="from-primary-700 to-white bg-gradient-to-br p-4 rounded-xl text-white mb-8">
        <EmptyState
          icon={DoorClosedLockedIcon}
          title="Chegou tarde demais ein..."
          description="Esse grupo não está aceitando mais apostas."
        />
      </div>
    )
  }

  if (authLoading) {
    return <LoadingState message="Carregando..." />
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto max-w-5xl px-4 space-y-8">
        {/* Header */}
        <h1 className="mb-8 text-4xl font-bold text-gray-50 text-center">
          Sua previsão para o Brasileirão 2026
        </h1>

        {/* Loading State */}
        {isLoadingBet && <LoadingState message="Carregando aposta..." />}

        {!isLoadingBet &&
          predictions.length === 0 &&
          emptyStateByDeadlineExpired()}

        {/* Group Selection */}
        {userGroups.length > 1 && (
          <div className="w-full from-primary-700 to-white bg-gradient-to-b p-4 rounded-lg space-y-4">
            <BetGroupSelectSimple
              groups={userGroups}
              onValueChange={handleSelectGroupId}
              value={selectedGroupId ? selectedGroupId : undefined}
              disabled={saveForAll || isLoadingBet}
            />
            <Checkbox
              id="allow-checkbox"
              label="Quero salvar minha aposta para todos os grupos que participo. (Somente atualizará aqueles grupos em que está dentro do prazo de apostar)"
              checked={saveForAll}
              onChange={handleSelectSaveForAll}
              disabled={isLoadingBet}
            />
          </div>
        )}

        {/* Predictions Table */}
        {!isLoadingBet && predictions.length > 0 && (
          <div className="space-y-8">
            <p className="text-lg text-gray-300">
              Arraste os times para ordenar como você acha que vão terminar
            </p>

            {/* Instructions */}
            <div className="my-4 rounded-lg from-primary-600 to-primary-700 bg-gradient-to-r p-4 text-center">
              <p className="text-sm text-white">
                💡 <strong>Dica:</strong> Clique e arraste o ícone de linhas
                (☰) para reordenar os times ou use os botões de setas
              </p>
            </div>

            {/* Drag & Drop Table */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="card mb-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="from-primary-600 to-primary-700 bg-gradient-to-r text-white">
                      <tr>
                        <th className="px-3 py-4 text-center text-sm font-semibold">
                          <svg
                            className="mx-auto h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 2h6v2H9V2zm0 4h6v2H9V6zm0 4h6v2H9v-2zm0 4h6v2H9v-2zm0 4h6v2H9v-2z" />
                          </svg>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Posição
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Time
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">
                          Mover
                        </th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={predictions.map((p) => p.teamId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="divide-y divide-gray-200">
                        {predictions.map((pred, index) => (
                          <SortableTableRow
                            key={pred.teamId}
                            pred={pred}
                            index={index}
                            disabled={isExpired}
                            getPositionColor={() => ''}
                            moveTeam={moveTeam}
                            predictionsLength={predictions.length}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </div>
              </div>
            </DndContext>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={!hasChanges || isSaving || isExpired}
                className="btn-primary relative px-12 py-4 text-lg hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Salvando...
                  </span>
                ) : (
                  <span>
                    {isExpired ? 'Apostas Encerradas' : 'Salvar Previsão'}
                  </span>
                )}
              </button>

              {/* Deadline Info */}
              <p className="mt-4 text-sm text-gray-200/90">
                {deadline
                  ? `Você pode editar sua previsão até ${deadline.toLocaleDateString(
                      'pt-BR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}`
                  : 'Você pode editar sua previsão a qualquer momento durante a temporada'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
