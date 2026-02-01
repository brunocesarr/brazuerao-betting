'use client'

import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  children: ReactNode
}

export function LoadingButton({
  isLoading = false,
  loadingText = 'Carregando...',
  children,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={`btn-primary relative ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
