'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface UseRequireAuthOptions {
  redirectTo?: string
  redirectIfFound?: boolean
}

/**
 * Hook para proteger páginas client-side
 * Redireciona usuários não autenticados
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/login', redirectIfFound = false } = options
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    console.log('🔐 [useRequireAuth] status da sessão:', status)
    // Aguardar verificação de sessão
    if (status === 'loading') return

    const shouldRedirect = redirectIfFound
      ? status === 'authenticated'
      : status === 'unauthenticated'

    if (shouldRedirect) {
      console.log('🔄 [useRequireAuth] Redirecionando para:', redirectTo)
      router.push(redirectTo)
    }
  }, [status, redirectTo, redirectIfFound, router])

  return {
    isAuthenticated: status === 'authenticated',
  }
}
