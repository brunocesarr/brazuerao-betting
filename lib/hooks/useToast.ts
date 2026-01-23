import { useCallback, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ShowToastOptions {
  type: ToastType
  message: string
  duration?: number
}

interface UseToastReturn {
  toasts: Toast[]
  showToast: (options: ShowToastOptions) => void
  removeToast: (id: string) => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(
    ({ type, message, duration = 5000 }: ShowToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast: Toast = { id, type, message }

      setToasts((prev) => [...prev, newToast])

      // Auto remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, duration)
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    removeToast,
  }
}
