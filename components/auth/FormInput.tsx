'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { forwardRef, InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
  helperText?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, success, helperText, className = '', ...props }, ref) => {
    const hasError = !!error
    const showSuccess = success && !hasError && props.value

    return (
      <div className="space-y-1">
        <label
          htmlFor={props.id}
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            className={`
            input-field pr-10 transition-all duration-200
            ${hasError ? 'border-red-500 focus:ring-red-500' : ''}
            ${showSuccess ? 'border-green-500 focus:ring-green-500' : ''}
            ${className}
          `}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${props.id}-error`
                : helperText
                  ? `${props.id}-helper`
                  : undefined
            }
            {...props}
          />

          {/* Success Icon */}
          {showSuccess && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          )}

          {/* Error Icon */}
          {hasError && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <p
            id={`${props.id}-error`}
            className="animate-fade-in text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper Text */}
        {!hasError && helperText && (
          <p id={`${props.id}-helper`} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
