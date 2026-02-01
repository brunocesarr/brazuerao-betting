import { useLeaderboard } from '@/lib/contexts/LeaderboardContext'
import Link from 'next/link'

export const EmptyState = () => {
  const { username } = useLeaderboard()
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center lg:py-16">
      <div className="mb-4 text-6xl">📊</div>
      <h3 className="mb-2 text-lg font-semibold text-white lg:text-xl">
        Nenhuma classificação disponível
      </h3>
      <p className="max-w-md text-sm text-gray-400 lg:text-base">
        As previsões ainda não foram registradas ou o grupo está vazio.
      </p>
      <p className="mt-2 text-sm text-white">Seja o primeiro a apostar</p>
      <Link
        href={username ? '/betting' : '/login'}
        className="mt-6 inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
      >
        Fazer Previsão
      </Link>
    </div>
  )
}
