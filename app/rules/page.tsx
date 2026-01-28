'use client'

import { RuleTypeEnum } from '@/helpers/constants'
import { getAllBetRules } from '@/services/brazuerao.service'
import { RulesAPIResponse } from '@/types'
import { useEffect, useState } from 'react'

// app/regras/page.tsx
export default function RegrasSimples() {
  const [rules, setRules] = useState<RulesAPIResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchRules() {
      try {
        const rules = await getAllBetRules()
        setRules(rules)
      } catch (error) {
        console.error('Erro ao buscar regras:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRules()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-600">Carregando regras...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen  bg-[#1a1a1a] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-white">
            Regulamento da Competição
          </h1>
          <p className="text-xl text-slate-100">
            Regras oficiais do Brazuerao 2026
          </p>
        </header>

        {/* Rules Sections */}
        <div className="space-y-8">
          <SecaoRegra titulo="1. Formato Geral">
            <p>
              O Brasileirão tem 20 equipes competem em formato de pontos
              corridos ida e volta (38 partidas por equipe). A pontuação será
              atualizada a cada jogo. Ao fim do Brasileirão também encerra o
              Brazuerao.
            </p>
          </SecaoRegra>

          <SecaoRegra titulo="2. Sistema de Pontuação">
            <ul className="list-inside list-disc space-y-2">
              {rules &&
                rules
                  .sort((a, b) => a.priority - b.priority)
                  .map((rule) => (
                    <li key={rule.id}>
                      {rule.description}:{' '}
                      {rule.points > 1
                        ? `${rule.points} pontos`
                        : `${rule.points} ponto`}
                    </li>
                  ))}
            </ul>
          </SecaoRegra>

          <SecaoRegra titulo="3. Classificação">
            <ul className="list-inside list-disc space-y-2">
              {rules.some(
                (rule) => rule.ruleType === RuleTypeEnum.champion
              ) && <li>Posição 1: Campeão</li>}
              {rules
                .filter((rule) => rule.ruleType === RuleTypeEnum.zone)
                .map((rule) => (
                  <li key={rule.id}>
                    Zonas de classificação:
                    <ul className="mt-1 ml-6 list-inside list-disc">
                      {rule.ranges?.map((range: any, index: number) => (
                        <li key={index}>
                          Posições {range.rangeStart}º a {range.rangeEnd}º
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
            </ul>
          </SecaoRegra>

          <SecaoRegra titulo="4. Critérios de Desempate">
            <ol className="list-inside list-decimal space-y-2">
              <li>Número de pontos</li>
              {rules &&
                rules
                  .sort((a, b) => a.priority - b.priority)
                  .map((rule) => <li key={rule.id}>{rule.description}</li>)}
            </ol>
          </SecaoRegra>

          <SecaoRegra titulo="5. Prendas">
            <ul className="list-inside list-disc space-y-2">
              <li>
                <b>A prenda é prenda! Deve ser paga.</b>
              </li>
              <li>O grupo define as prendas a serem aplicadas</li>
              <li>O grupo define quando as prendas são aplicadas</li>
            </ul>
            <p className="mt-3 text-right text-xs">
              Podem ser revistas e alteradas até a data limite da aposta.
            </p>
          </SecaoRegra>
        </div>
      </div>
    </div>
  )
}

function SecaoRegra({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-slate-800">{titulo}</h2>
      <div className="text-slate-700">{children}</div>
    </section>
  )
}
