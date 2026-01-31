'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { LoadingState } from '@/components/shared/LoadingState'
import { ConfirmDialogProvider } from '@/lib/contexts/DialogContext'
import { ToastProvider } from '@/lib/contexts/ToastContext'
import { SessionProvider, useSession } from 'next-auth/react'

function ProvidersContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession()

  if (status === 'loading') return <LoadingState message="Carregando..." />

  return (
    <ConfirmDialogProvider>
      <ToastProvider>
        <SessionProvider>
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
    <SessionProvider>
      <ProvidersContent>{children}</ProvidersContent>
    </SessionProvider>
  )
}
