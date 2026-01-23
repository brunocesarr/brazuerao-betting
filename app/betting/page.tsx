'use client'

import SortableTableRow from '@/components/betting/SortableTableRow'
import { useToast } from '@/lib/contexts/ToastContext'
import {
  getBetByUserId,
  getBrazilianLeague,
  saveUserBet,
} from '@/services/brazuerao.service'
import { TeamPrediction } from '@/types'
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
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BettingPage() {
  const { status } = useSession()
  const router = useRouter()
  const [savedPredictions, setSavedPredictions] = useState<TeamPrediction[]>([])
  const [predictions, setPredictions] = useState<TeamPrediction[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const checkForChanges = () => {
      if (!savedPredictions) {
        setHasChanges(false)
        return
      }
      setHasChanges(
        JSON.stringify(predictions) !== JSON.stringify(savedPredictions)
      )
    }

    checkForChanges()
  }, [predictions, savedPredictions])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSavedBet()
    }
  }, [])

  const fetchSavedBet = async () => {
    try {
      setLoading(true)
      const [bet, table] = await Promise.all([
        getBetByUserId(),
        getBrazilianLeague(),
      ])

      const initialPredictions: TeamPrediction[] = table.map(
        (team: any, index: number) => {
          let position = team.position
          if (bet && bet.predictions) {
            const savedTeam = bet.predictions.find(
              (pred: TeamPrediction) => pred.teamName === team.name
            )
            if (savedTeam) {
              position = savedTeam.position
            }
          }

          return {
            teamId: String(index),
            teamName: team.name,
            position: position,
            shieldUrl: team.shield,
          }
        }
      )

      setPredictions(initialPredictions)
      setSavedPredictions(bet ? initialPredictions : [])
    } catch (error) {
      console.error('Failed to fetch saved bet:', error)
      setSavedPredictions([])
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    setPredictions((items) => {
      const oldIndex = items.findIndex((item) => item.teamId === active.id)
      const newIndex = items.findIndex((item) => item.teamId === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)

      // Update positions
      newItems.forEach((pred, idx) => {
        pred.position = idx + 1
      })

      return newItems
    })
  }

  const moveTeam = (index: number, direction: 'up' | 'down') => {
    const newPredictions = [...predictions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newPredictions.length) return
    ;[newPredictions[index], newPredictions[targetIndex]] = [
      newPredictions[targetIndex],
      newPredictions[index],
    ]

    newPredictions.forEach((pred, idx) => {
      pred.position = idx + 1
    })

    setPredictions(newPredictions)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      saveUserBet(predictions.map((p) => p.teamName))
      setSavedPredictions(predictions)

      showToast({
        message: 'Sua previsão foi salva com sucesso!',
        type: 'success',
      })
    } catch (error) {
      showToast({
        message: 'Falha ao salvar sua previsão. Tente novamente.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary-600 mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const getPositionColor = (position: number) => {
    if (position <= 4) return 'bg-blue-50 border-blue-200'
    if (position <= 16) return 'bg-green-50 border-green-200'
    return 'bg-red-50 border-red-200'
  }

  const getPositionBadge = (position: number) => {
    if (position <= 4) return { text: 'Libertadores', color: 'bg-blue-500' }
    if (position <= 16) return { text: 'Sul-Americana', color: 'bg-green-500' }
    return { text: 'Rebaixamento', color: 'bg-red-500' }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-50">
            Sua previsão para o Brasileirão 2026
          </h1>
          <p className="text-lg text-gray-300">
            Arraste os times para ordenar como você acha que vão terminar
          </p>
        </div>

        {/* Legend */}
        <div className="card mb-6 p-6">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded bg-blue-500"></div>
              <span className="text-sm text-gray-700">
                Zona classificação (1-4)
              </span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded bg-green-500"></div>
              <span className="text-sm text-gray-700">
                Zona meio de tabela (5-16)
              </span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded bg-red-500"></div>
              <span className="text-sm text-gray-700">
                Zona de rebaixamento (17-20)
              </span>
            </div>
          </div>
        </div>

        {/* Drag Instructions */}
        <div className="mb-4 rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Clique e arraste o ícone de linhas (☰)
            para reordenar os times ou use os botões de setas
          </p>
        </div>

        {/* Standings Table with Drag & Drop */}
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
                        getPositionColor={getPositionColor}
                        getPositionBadge={getPositionBadge}
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

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !hasChanges}
            className="btn-primary relative px-12 py-4 text-lg"
          >
            {loading ? (
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
              <>
                Salvar
                {!hasChanges && (
                  <span className="ml-2 text-sm opacity-75">
                    (Sem alterações)
                  </span>
                )}
              </>
            )}
          </button>
          <p className="mt-4 text-sm text-gray-200/90">
            Você pode editar sua previsão a qualquer momento antes do início da
            temporada
          </p>
        </div>
      </div>
    </div>
  )
}
