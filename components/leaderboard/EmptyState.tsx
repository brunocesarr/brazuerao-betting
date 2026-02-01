import { useLeaderboard } from '@/lib/contexts/LeaderboardContext'
import Link from 'next/link'

export const EmptyState = () => {
  const { username } = useLeaderboard()
  return (
    <div className="px-6 py-16 text-center">
      <div className="text-lg text-gray-500">
        <div className="mb-4 text-6xl">🎯</div>
        <p className="font-semibold">Nenhuma previsão ainda!</p>
        <p className="mt-2 text-sm">Seja o primeiro a apostar</p>
        <Link
          href={username ? '/betting' : '/login'}
          className="mt-6 inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
        >
          Fazer Previsão
        </Link>
      </div>
    </div>
  )
}
