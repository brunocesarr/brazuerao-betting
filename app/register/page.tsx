'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Falha no registro')
      } else {
        router.push('/login?registered=true')
      }
    } catch (error) {
      setError('Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="from-primary-50 flex items-center justify-center bg-gradient-to-b via-white to-black px-4 py-12 sm:px-6 md:min-h-screen lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="from-primary-500 to-primary-700 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
            <span className="text-3xl">⚽</span>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Junte-se à liga
          </h2>
          <p className="text-gray-600">
            Crie sua conta e comece a fazer previsões
          </p>
        </div>

        {/* Form Card */}
        <div className="card animate-slide-in-up p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="animate-fade-in rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
                <div className="flex items-center">
                  <span className="mr-2 text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                required
                className="input-field"
                placeholder="João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Deve ter pelo menos 6 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 w-full py-3 text-base"
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
                  Criando conta...
                </span>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="card mt-8 p-6">
          <h3 className="mb-3 font-semibold text-gray-900">
            Entre e aproveite:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="text-primary-500 mr-2">✓</span>
              Compita entre amigos
            </li>
            <li className="flex items-center">
              <span className="text-primary-500 mr-2">✓</span>
              Defina suas prendas para o perdedor
            </li>
            <li className="flex items-center">
              <span className="text-primary-500 mr-2">✓</span>
              Edite suas previsões a qualquer momento
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
