'use client'

import { ErrorAlert } from '@/components/auth/ErrorAlert'
import { FormInput } from '@/components/auth/FormInput'
import { LoadingButton } from '@/components/auth/LoadingButton'
import {
  resetPasswordSchema,
  type ResetPasswordData,
} from '@/lib/validations/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
    },
  })

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false)
      setTokenValid(false)
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const result = await response.json()
        setTokenValid(result.valid)
      } catch {
        setTokenValid(false)
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      setError('')

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erro ao resetar senha')
        return
      }

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 3000)
    } catch (err) {
      setError('Erro ao resetar senha. Tente novamente.')
    }
  }

  // Validating token
  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 via-white to-gray-50 px-4">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-gray-600">Validando link...</p>
        </div>
      </div>
    )
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 via-white to-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Link Inválido ou Expirado
            </h1>

            <p className="mb-6 text-gray-600">
              Este link de recuperação de senha é inválido, já foi usado ou
              expirou.
            </p>

            <Link
              href="/forgot-password"
              className="btn-primary inline-block w-full"
            >
              Solicitar Novo Link
            </Link>

            <Link
              href="/login"
              className="mt-4 block text-sm text-gray-600 hover:text-gray-900"
            >
              Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 via-white to-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Senha Alterada!
            </h1>

            <p className="mb-6 text-gray-600">
              Sua senha foi alterada com sucesso. Redirecionando para login...
            </p>

            <Link href="/login" className="btn-primary inline-block w-full">
              Ir para Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Reset form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 via-white to-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Nova Senha</h1>
          <p className="text-gray-600">Digite sua nova senha abaixo</p>
        </div>

        {/* Form */}
        <div className="card animate-slide-in-up p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <ErrorAlert message={error} onDismiss={() => setError('')} />
            )}

            <input type="hidden" {...register('token')} value={token || ''} />

            <FormInput
              id="password"
              type="password"
              label="Nova Senha"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              error={errors.password?.message}
              helperText="Escolha uma senha forte"
              {...register('password')}
            />

            <FormInput
              id="confirmPassword"
              type="password"
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Salvando..."
              className="w-full"
            >
              Alterar Senha
            </LoadingButton>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
            >
              ← Voltar para Login
            </Link>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="mb-2 text-sm font-semibold text-blue-900">
            💡 Dicas de segurança:
          </p>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• Use pelo menos 8 caracteres</li>
            <li>• Combine letras, números e símbolos</li>
            <li>• Evite informações pessoais óbvias</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
