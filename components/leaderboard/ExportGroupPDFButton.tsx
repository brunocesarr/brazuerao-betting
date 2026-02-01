'use client'

import { useToast } from '@/lib/contexts/ToastContext'
import {
  generateGroupPredictionsPDF,
  generatePredictionsComparisonPDF,
  generateSimpleLeaderboardPDF,
} from '@/lib/pdf-generator'
import { LeaderboardEntry, RuleBet } from '@/types/domain'
import { Download, FileText, List, Loader2, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ExportGroupPDFDropdownProps {
  groupName: string
  deadline: Date | string
  leaderboard: LeaderboardEntry[]
  disabled: boolean
  className?: string
  getRuleByRuleId: (ruleId: string) => RuleBet | undefined
}

export default function ExportGroupPDFDropdown({
  groupName,
  deadline,
  leaderboard,
  getRuleByRuleId,
  disabled,
  className = '',
}: ExportGroupPDFDropdownProps) {
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (type: 'detailed' | 'simple' | 'predictions') => {
    if (leaderboard.length === 0) {
      showToast({
        type: 'error',
        message: 'Não há dados para exportar',
      })
      return
    }

    setIsGenerating(true)
    setIsOpen(false)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const data = { groupName, deadline, leaderboard, getRuleByRuleId }

      if (type === 'simple') {
        generateSimpleLeaderboardPDF(data)
      } else if (type === 'predictions') {
        generatePredictionsComparisonPDF(data)
      } else {
        generateGroupPredictionsPDF(data)
      }

      showToast({
        type: 'success',
        message: 'PDF gerado com sucesso!',
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      showToast({
        type: 'error',
        message: 'Erro ao gerar PDF. Tente novamente.',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isGenerating || leaderboard.length === 0}
        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Exportar previsões"
        aria-expanded={isOpen}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="hidden sm:inline">Gerando...</span>
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
            <svg
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isGenerating && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-in fade-in slide-in-from-top-2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg duration-200">
          <button
            onClick={() => handleExport('detailed')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:cursor-pointer"
          >
            <FileText className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Relatório Completo</p>
              <p className="text-xs text-gray-500">Com detalhes de pontuação</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('predictions')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:cursor-pointer"
          >
            <Trophy className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium">Previsões de Classificação</p>
              <p className="text-xs text-gray-500">
                Comparação de previsões finais
              </p>
            </div>
          </button>

          <button
            onClick={() => handleExport('simple')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:cursor-pointer"
          >
            <List className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Classificação Simples</p>
              <p className="text-xs text-gray-500">Apenas ranking</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
