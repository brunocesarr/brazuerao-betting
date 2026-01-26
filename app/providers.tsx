'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { ConfirmDialogProvider } from '@/lib/contexts/DialogContext'
import { ToastProvider } from '@/lib/contexts/ToastContext'
import { SessionProvider } from 'next-auth/react'

function ProvidersContent({ children }: { children: React.ReactNode }) {
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
  return <ProvidersContent>{children}</ProvidersContent>
}
