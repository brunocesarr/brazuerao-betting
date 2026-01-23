'use client'

import { Toast as ToastType } from '@/lib/hooks/useToast'
import { clsx } from 'clsx'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InfoIcon,
  warning: AlertCircleIcon,
}

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
}

export function Toast({ toast, onRemove }: ToastProps) {
  const Icon = icons[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      className={clsx(
        'pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all',
        styles[toast.type],
        'animate-in slide-in-from-top-5 fade-in duration-300'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={clsx('h-5 w-5 flex-shrink-0', iconStyles[toast.type])}
        />
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 rounded p-0.5 hover:bg-black/5 transition-colors"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastType[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="pointer-events-none fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 sm:p-6">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
