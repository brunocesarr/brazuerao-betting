'use client'

import { ErrorAlert } from '@/components/auth/ErrorAlert'
import { FormInput } from '@/components/auth/FormInput'
import { LoadingButton } from '@/components/auth/LoadingButton'
import {
  forgotPasswordSchema,
  type ForgotPasswordData,
} from '@/lib/validations/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      setError('')
      setSuccess(false)

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erro ao processar solicitação')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Erro ao processar solicitação. Tente novamente.')
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 via-white to-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card animate-slide-in-up p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Email Enviado!
            </h1>

            <p className="mb-6 text-gray-600">
              Se o email estiver cadastrado, você receberá instruções para
              resetar sua senha.
            </p>

            <p className="mb-8 text-sm text-gray-500">
              Verifique sua caixa de entrada e spam. O link expira em 1 hora.
            </p>

            <Link href="/login" className="btn-primary inline-block w-full">
              Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 via-white to-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Esqueceu sua senha?
          </h1>
          <p className="text-gray-600">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        {/* Form */}
        <div className="card animate-slide-in-up p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <ErrorAlert message={error} onDismiss={() => setError('')} />
            )}

            <FormInput
              id="email"
              type="email"
              label="Email"
              placeholder="seu@email.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Enviando..."
              className="w-full"
            >
              Enviar Link de Recuperação
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

        {/* Security Notice */}
        <div className="mt-6 rounded-lg p-4 text-center from-primary-700 via-primary-600 to-primary-500 bg-gradient-to-br">
          <p className="text-sm text-white">
            🔒 Por segurança, não informamos se o email está cadastrado
          </p>
        </div>
      </div>
    </div>
  )
}
