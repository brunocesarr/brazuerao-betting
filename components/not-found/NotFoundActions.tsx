'use client'

import { Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export function SoccerNotFoundActions() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
      <Link
        href="/"
        className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-700 hover:shadow-xl"
      >
        {/* Shine Effect */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <Home className="relative h-5 w-5 transition-transform group-hover:-translate-y-1" />
        <span className="relative">Voltar ao Jogo</span>
      </Link>

      <button
        onClick={handleRefresh}
        className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-gray-600 bg-transparent px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-gray-500 hover:bg-gray-800"
      >
        {/* Shine Effect */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <RefreshCw className="relative h-5 w-5 transition-transform group-hover:rotate-180" />
        <span className="relative">Tentar Novamente</span>
      </button>
    </div>
  )
}
