'use client'

import { useEffect } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    info: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
          {/* Content */}
          <div className="bg-white px-6 py-5">
            <div className="flex items-start">
              {/* Icon */}
              <div
                className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                  variant === 'danger'
                    ? 'bg-red-100'
                    : variant === 'warning'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
                }`}
              >
                {variant === 'danger' && (
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                )}
                {variant === 'warning' && (
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                )}
                {variant === 'info' && (
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                )}
              </div>

              {/* Text */}
              <div className="ml-4 mt-0 text-left">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="mt-2 text-sm text-gray-500">{message}</div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <Button
              type="button"
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
            <Button
              className="rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
