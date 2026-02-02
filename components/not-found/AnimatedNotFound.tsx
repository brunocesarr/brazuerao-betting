'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SoccerNotFoundActions } from './NotFoundActions'

export function AnimatedNotFound() {
  const [mounted, setMounted] = useState(false)
  const [score404, setScore404] = useState(0)
  const [score100, setScore100] = useState(0)

  useEffect(() => {
    setMounted(true)

    // Animate counters
    const duration = 2000
    const steps = 60

    const animate404 = setInterval(() => {
      setScore404((prev) => {
        if (prev >= 404) {
          clearInterval(animate404)
          return 404
        }
        return prev + Math.ceil(404 / steps)
      })
    }, duration / steps)

    const animate100 = setInterval(() => {
      setScore100((prev) => {
        if (prev >= 100) {
          clearInterval(animate100)
          return 100
        }
        return prev + Math.ceil(100 / steps)
      })
    }, duration / steps)

    return () => {
      clearInterval(animate404)
      clearInterval(animate100)
    }
  }, [])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1a1a1a] px-4 py-16">
      {/* Floating Soccer Balls Background */}
      <div className="pointer-events-none fixed inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          >
            <div className="text-4xl md:text-6xl">⚽</div>
          </div>
        ))}
      </div>

      {/* Animated Gradient Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-64 w-64 animate-blob rounded-full bg-primary-500 opacity-20 blur-3xl" />
        <div className="animation-delay-2000 absolute -right-4 top-1/3 h-64 w-64 animate-blob rounded-full bg-purple-500 opacity-20 blur-3xl" />
        <div className="animation-delay-4000 absolute bottom-1/4 left-1/2 h-64 w-64 animate-blob rounded-full bg-pink-500 opacity-20 blur-3xl" />
      </div>

      <div
        className={`relative w-full max-w-4xl transition-all duration-1000 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="rounded-2xl bg-gradient-to-br from-primary-800 to-primary-900 p-8 shadow-2xl backdrop-blur-sm md:p-12">
          {/* Soccer Ball with Spinning Animation */}
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex items-center justify-center">
              <div className="relative">
                {/* Spinning Soccer Ball */}
                <div className="animate-spin-slow text-9xl">⚽</div>

                {/* Pulsing 404 Badge */}
                <div className="absolute -right-4 -top-4 flex h-16 w-16 animate-bounce-gentle items-center justify-center rounded-full bg-red-500 text-2xl font-bold text-white shadow-lg">
                  404
                </div>

                {/* Orbiting Dots */}
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute left-0 top-0 h-3 w-3 animate-orbit rounded-full bg-yellow-400" />
                  <div className="animation-delay-1000 absolute left-0 top-0 h-3 w-3 animate-orbit rounded-full bg-green-400" />
                  <div className="animation-delay-2000 absolute left-0 top-0 h-3 w-3 animate-orbit rounded-full bg-blue-400" />
                </div>
              </div>
            </div>

            {/* Animated Text */}
            <h1 className="mb-4 animate-fade-in-up text-4xl font-bold text-white md:text-6xl">
              Gol Perdido!
            </h1>
            <p className="animation-delay-200 mx-auto mb-2 max-w-lg animate-fade-in-up text-xl text-gray-300">
              A página que você procura saiu do campo.
            </p>
            <p className="animation-delay-400 animate-fade-in-up text-gray-400">
              Parece que o árbitro marcou impedimento nesta URL.
            </p>
          </div>

          {/* Animated Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="animation-delay-600 group animate-fade-in-up rounded-lg bg-gray-800/50 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gray-800/70">
              <div className="mb-1 text-3xl font-bold text-red-400 transition-all group-hover:scale-110">
                {score404}
              </div>
              <div className="text-sm text-gray-400">Código do Erro</div>
            </div>
            <div className="animation-delay-800 group animate-fade-in-up rounded-lg bg-gray-800/50 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gray-800/70">
              <div className="mb-1 text-3xl font-bold text-yellow-400 transition-all group-hover:scale-110">
                {0}%
              </div>
              <div className="text-sm text-gray-400">Chance de Sucesso</div>
            </div>
            <div className="animation-delay-1000 group animate-fade-in-up rounded-lg bg-gray-800/50 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gray-800/70">
              <div className="mb-1 text-3xl font-bold text-green-400 transition-all group-hover:scale-110">
                {score100}%
              </div>
              <div className="text-sm text-gray-400">Pode Voltar</div>
            </div>
          </div>

          {/* Action Buttons with Stagger Animation */}
          <div className="animation-delay-1200 animate-fade-in-up">
            <SoccerNotFoundActions />
          </div>

          {/* Popular Links with Stagger */}
          <div className="animation-delay-1400 mt-12 animate-fade-in-up border-t border-gray-700 pt-8">
            <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-gray-400">
              Links Populares
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: '/leaderboard', icon: '🏆', label: 'Classificação' },
                { href: '/betting', icon: '⚽', label: 'Apostas' },
                { href: '/user/groups', icon: '👥', label: 'Grupos' },
              ].map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group animate-fade-in-up rounded-full bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-all duration-300 hover:-translate-y-1 hover:bg-gray-700 hover:text-white hover:shadow-lg"
                  style={{
                    animationDelay: `${1600 + index * 100}ms`,
                  }}
                >
                  <span className="inline-block transition-transform group-hover:scale-125">
                    {link.icon}
                  </span>{' '}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Effect */}
      <div className="pointer-events-none fixed inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: [
                  '#ef4444',
                  '#f59e0b',
                  '#10b981',
                  '#3b82f6',
                  '#8b5cf6',
                ][Math.floor(Math.random() * 5)],
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
