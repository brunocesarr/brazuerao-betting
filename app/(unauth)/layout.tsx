'use client'

import { LoadingState } from '@/components/shared/LoadingState'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') router.push('/user/profile')
  }, [status])

  if (status !== 'unauthenticated')
    return <LoadingState message="Carregando..." />

  return children
}
