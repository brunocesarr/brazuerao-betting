import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const PageHeader = () => (
  <div className="mb-8">
    <Link
      href="/leaderboard"
      className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
    >
      <ArrowLeft size={20} />
      Voltar para Classificação
    </Link>
    <h1 className="text-3xl font-bold text-white mb-2">
      Detalhes da Pontuação
    </h1>
    <p className="text-gray-400">Veja como seus pontos foram distribuídos</p>
  </div>
)
