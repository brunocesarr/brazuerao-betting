'use client'

import { AlertTriangle, X } from 'lucide-react'

interface ErrorAlertProps {
  message: string
  onDismiss?: () => void
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div
      className="animate-fade-in rounded-lg border-l-4 border-red-500 bg-red-50 p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-auto flex-shrink-0 rounded-md p-1 text-red-600 transition-colors hover:bg-red-100"
            aria-label="Fechar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
