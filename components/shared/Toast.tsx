'use client'

import { Toast as ToastType } from '@/lib/contexts/ToastContext'
import { clsx } from 'clsx'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

interface ToastContainerProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

const TOAST_DURATION = 5000
const ANIMATION_DURATION = 300

const ICONS = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InfoIcon,
  warning: AlertCircleIcon,
} as const

const STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
} as const

const ICON_STYLES = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
} as const

// ============================================================================
// TOAST COMPONENT
// ============================================================================

export function Toast({ toast, onRemove }: ToastProps) {
  const Icon = ICONS[toast.type]
  const [isVisible, setIsVisible] = useState(false)
  const toastRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)

  // ============================================================================
  // HANDLERS (Defined before effects)
  // ============================================================================

  /**
   * Handle toast dismissal with exit animation
   */
  const handleDismiss = useCallback(() => {
    setIsVisible(false)

    // Remove after animation completes
    setTimeout(() => {
      onRemove(toast.id)
    }, ANIMATION_DURATION)
  }, [toast.id, onRemove])

  /**
   * Handle manual close button click
   */
  const handleClose = useCallback(() => {
    // Clear auto-dismiss timer
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    handleDismiss()
  }, [handleDismiss])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Trigger entrance animation
   * Deferred to avoid cascading renders
   */
  useEffect(() => {
    animationRef.current = requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  /**
   * Auto-dismiss after duration
   */
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      handleDismiss()
    }, TOAST_DURATION)

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleDismiss])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={clsx(
        'pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg',
        'transition-all duration-300 ease-in-out',
        STYLES[toast.type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={clsx('h-5 w-5 flex-shrink-0', ICON_STYLES[toast.type])}
          aria-hidden="true"
        />
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 rounded p-0.5 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label="Fechar notificação"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// TOAST CONTAINER COMPONENT
// ============================================================================

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      aria-label="Notificações"
      aria-live="polite"
      className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 sm:p-6"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
