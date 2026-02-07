'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

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
  const hasRedirected = useRef(false)

  useEffect(() => {
    console.log('🔐 [useRequireAuth] status da sessão:', status)
    // Aguardar verificação de sessão
    if (status === 'loading') return

    const shouldRedirect = redirectIfFound
      ? status === 'authenticated'
      : status === 'unauthenticated'

    if (shouldRedirect) {
      console.log('🔄 [useRequireAuth] Redirecionando para:', redirectTo)
      hasRedirected.current = true

      router.replace(redirectTo)
      setTimeout(() => {
        if (hasRedirected.current) {
          window.location.href = redirectTo
        }
      }, 100)
    }
  }, [status, redirectTo, redirectIfFound, router])

  return {
    isAuthenticated: status === 'authenticated',
  }
}
