'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setLoading(true)
      setError('')

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha inválidos')
      } else {
        router.push('/user/profile')
      }
    } catch (error) {
      console.error('Submit login error. Error:', error)
      setError('Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="from-primary-50 flex items-center justify-center bg-gradient-to-b via-white to-black px-4 py-12 sm:px-6 md:min-h-screen lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="to-primary-50/20 mb-2 h-16 w-16 transform overflow-hidden rounded-lg border-1 border-transparent bg-gradient-to-br from-transparent bg-clip-border p-1 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
            <div className="relative h-12 w-12">
              <Image
                src="/logo.ico"
                className="logo"
                alt="Logo do Brasileirão"
                priority
                fill
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADA..."
                sizes="(min-width: 60em) 24vw,
                      (min-width: 28em) 45vw,
                      100vw"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Bem-vindo de volta!
          </h2>
        </div>

        {/* Form Card */}
        <div className="card animate-slide-in-up p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="seu@email.com"
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
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base hover:cursor-pointer"
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
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Crie uma conta agora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
