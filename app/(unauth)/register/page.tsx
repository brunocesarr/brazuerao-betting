'use client'

import { ErrorAlert } from '@/components/auth/ErrorAlert'
import { FormInput } from '@/components/auth/FormInput'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { useRegister } from '@/lib/hooks/useRegister'
import { RegisterFormData, registerSchema } from '@/lib/validations/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'

// ============================================================================
// COMPONENTS
// ============================================================================

function RegisterHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
        <span className="text-3xl">⚽</span>
      </div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Junte-se à Liga</h1>
      <p className="text-gray-600">Crie sua conta e comece a fazer previsões</p>
    </div>
  )
}

function BenefitsList() {
  const benefits = [
    'Compita entre amigos',
    'Defina suas prendas para o perdedor',
    'Edite suas previsões a qualquer momento',
  ]

  return (
    <div className="card mt-8 p-6">
      <h3 className="mb-3 font-semibold text-gray-900">Entre e aproveite:</h3>
      <ul className="space-y-2 text-sm text-gray-600">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center">
            <span className="mr-2 text-primary-500">✓</span>
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  })

  const onSubmit = async (data: RegisterFormData) => {
    // Remove confirmPassword before sending
    const { confirmPassword, ...registerData } = data
    await registerUser(registerData)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 via-white to-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <RegisterHeader />

        <div className="card animate-slide-in-up p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {error && <ErrorAlert message={error} onDismiss={clearError} />}

            <FormInput
              id="name"
              type="text"
              label="Nome completo"
              placeholder="João Silva"
              error={errors.name?.message}
              success={touchedFields.name && !errors.name}
              {...register('name')}
            />

            <FormInput
              id="email"
              type="email"
              label="Email"
              placeholder="seu@email.com"
              autoComplete="email"
              error={errors.email?.message}
              success={touchedFields.email && !errors.email}
              {...register('email')}
            />

            <FormInput
              id="password"
              type="password"
              label="Senha"
              placeholder="Crie uma senha segura"
              autoComplete="new-password"
              error={errors.password?.message}
              success={touchedFields.password && !errors.password}
              helperText="Deve conter maiúscula, minúscula e número"
              {...register('password')}
            />

            <FormInput
              id="confirmPassword"
              type="password"
              label="Confirmar senha"
              placeholder="Digite a senha novamente"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              success={touchedFields.confirmPassword && !errors.confirmPassword}
              {...register('confirmPassword')}
            />

            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Criando conta..."
              className="mt-6 w-full py-3 text-base"
            >
              Criar conta
            </LoadingButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>

        <BenefitsList />
      </div>
    </div>
  )
}
