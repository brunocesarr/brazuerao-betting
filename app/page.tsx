'use client'

import CountdownTimer from '@/components/home/CountdownTimer'
import { Dates } from '@/helpers/constants'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { status } = useSession()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden bg-gradient-to-br text-white">
        <div className="bg-pattern absolute inset-0 opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 container mx-auto px-4 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-block">
              <span className="rounded-full bg-white/20 px-8 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                ⚽ Temporada {new Date().getFullYear()}
              </span>
            </div>

            <h1 className="mb-6 text-6xl leading-tight font-bold md:text-7xl">
              Brazuerao Apostas
              <span className="block bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-3xl text-transparent">
                O Brazuerao está de cara nova!
              </span>
            </h1>

            <p className="text-primary-100 mx-auto mb-12 max-w-2xl text-xl leading-relaxed md:text-2xl">
              Conheça o novo site!
              <br />
              Aproveite e faça suas previsões sobre a classificação final e
              compita!
            </p>

            {new Date(Dates.EXPIRATION_DATE_BET) <= new Date() ? (
              <div className="mb-12 flex flex-col items-center justify-center gap-6 rounded-xl bg-slate-950/10 p-8 backdrop-blur-sm">
                <p className="text-lg text-gray-400">
                  Contagem regressiva para o começo do Brasileirão{' '}
                  {new Date().getFullYear()} encerrou...
                </p>
                <div className="grid grid-cols-2 gap-4 text-center md:flex">
                  <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">
                      Está aberta a temporada {new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <CountdownTimer
                targetDate={new Date(Dates.EXPIRATION_DATE_BET)}
              />
            )}

            <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
              {status === 'authenticated' ? (
                <Link
                  href="/betting"
                  className="flex-1 transform rounded-xl border-1 border-white/10 bg-transparent px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-2xl"
                >
                  Continue apostando
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="flex-1 transform rounded-xl border-1 border-white/10 bg-transparent px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-2xl"
                >
                  Comece a apostar agora
                </Link>
              )}
              <Link
                href="/leaderboard"
                className="flex-1 transform rounded-xl border-1 border-white/10 bg-transparent px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-2xl"
              >
                Veja a Classificação
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-300">20</div>
                <div className="text-primary-100 mt-1 text-sm">Times</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-300">38</div>
                <div className="text-primary-100 mt-1 text-sm">Rodadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute right-0 bottom-0 left-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Como funciona?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Três passos simples para entrar na competição
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="card transform p-8 text-center transition-all duration-300 hover:scale-105">
              <div className="from-primary-500 to-primary-600 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                1. Faça sua previsão
              </h3>
              <p className="leading-relaxed text-gray-600">
                Ordene os 20 times na ordem que você acha que vão terminar a
                temporada
              </p>
            </div>

            <div className="card transform p-8 text-center transition-all duration-300 hover:scale-105">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                2. Compita
              </h3>
              <p className="leading-relaxed text-gray-600">
                Ganhe pontos.
                <br />
                Veja como você pode pontuar:{' '}
                <Link
                  href="/rules"
                  className="text-primary-600 hover:underline"
                  scroll
                >
                  regras
                </Link>
              </p>
            </div>

            <div className="card transform p-8 text-center transition-all duration-300 hover:scale-105">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                3. Vença
              </h3>
              <p className="leading-relaxed text-gray-600">
                Prove que você é o maior especialista do Brasileirão
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="from-primary-600 to-primary-700 relative overflow-hidden bg-gradient-to-b py-20 text-white">
        <div className="bg-pattern absolute inset-0 opacity-10"></div>
        {status !== 'authenticated' && (
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Pronto para mostrar suas habilidades?
            </h2>
            <p className="text-primary-100 mx-auto mb-10 max-w-2xl text-xl">
              Junte-se a nós fazendo suas previsões para o Brasileirão 2026
            </p>
            <Link
              href="/register"
              className="text-primary-700 hover:bg-primary-50 hover:shadow-3xl inline-block transform rounded-xl bg-white px-10 py-4 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Criar conta gratuita
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
