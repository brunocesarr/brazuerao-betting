'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { ToastContainer } from '@/components/ui/Toast'
import { ToastProvider, useToast } from '@/lib/contexts/ToastContext'
import { SessionProvider } from 'next-auth/react'

function ProvidersContent({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast()
  return (
    <SessionProvider>
      <Navbar />
      {children}
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SessionProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProvidersContent>{children}</ProvidersContent>
    </ToastProvider>
  )
}
