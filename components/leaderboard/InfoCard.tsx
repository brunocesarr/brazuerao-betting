import { RuleBet } from '@/types'
import Link from 'next/link'

export const InfoCard = ({ rules }: { rules: RuleBet[] }) => (
  <div className="mt-8 rounded-lg border border-green-500/30 bg-green-500/10 p-6">
    <div className="flex items-start gap-4">
      <div className="text-4xl">💡</div>
      <div>
        <h3 className="mb-2 text-lg font-bold text-white">
          Como funciona a pontuação
        </h3>
        <ul className="text-sm leading-relaxed text-gray-300 space-y-1">
          {rules.map((rule) => (
            <li key={rule.id}>
              • <strong>{rule.description}:</strong> {rule.points}{' '}
              {rule.points > 1 ? 'pontos' : 'ponto'}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-gray-300">
          Veja mais detalhes nas{' '}
          <Link href="/rules" className="text-green-400 hover:underline">
            regras completas
          </Link>
          .
        </p>
      </div>
    </div>
  </div>
)
