'use client'

import { useToast } from '@/lib/contexts/ToastContext'
import type { RegisterFormDataSimple } from '@/lib/validations/auth.schema'
import { createNewUser } from '@/services/user.service'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UseRegisterReturn {
  register: (data: RegisterFormDataSimple) => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useRegister(): UseRegisterReturn {
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const register = async (data: RegisterFormDataSimple) => {
    setIsLoading(true)
    setError(null)

    try {
      const { ok: success, error: apiError } = await createNewUser(
        data.name.trim(),
        data.email.toLowerCase().trim(),
        data.password
      )

      if (!success) {
        const errorMessage = apiError || 'Falha no registro. Tente novamente.'
        setError(errorMessage)
        showToast({
          type: 'error',
          message: errorMessage,
        })
        return
      }

      // Success
      showToast({
        type: 'success',
        message: 'Conta criada com sucesso! Faça login para continuar.',
      })

      // Redirect to login
      router.push('/login?registered=true')
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro inesperado. Tente novamente.'

      setError(errorMessage)
      showToast({
        type: 'error',
        message: errorMessage,
      })

      console.error('[Register Error]', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    register,
    isLoading,
    error,
    clearError,
  }
}
