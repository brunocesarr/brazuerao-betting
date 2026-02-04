'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { LoadingState } from '@/components/shared/LoadingState'
import { ConfirmDialogProvider } from '@/lib/contexts/DialogContext'
import { ToastProvider } from '@/lib/contexts/ToastContext'
import { Analytics } from '@vercel/analytics/next'
import { Session } from 'next-auth'
import { getSession, SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'

function ProvidersContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true)
        const session = await getSession()
        setSession(session)
      } catch (error) {
        console.error('Erro ao buscar a sessão:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  if (isLoading) return <LoadingState message="Carregando..." />

  return (
    <ConfirmDialogProvider>
      <ToastProvider>
        <SessionProvider session={session}>
          <Navbar />
          {children}
          <Footer />
        </SessionProvider>
      </ToastProvider>
    </ConfirmDialogProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProvidersContent cz-shortcut-listen="true">{children}</ProvidersContent>
      <Analytics />
    </>
  )
}
