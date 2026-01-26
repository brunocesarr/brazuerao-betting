'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfileSchema } from '@/helpers/schemas'
import { UserProfile as User } from '@/types'
import { FormEvent, useState } from 'react'
import { z } from 'zod'

interface ProfileFormProps {
  user: User
  onSubmit: (name: string) => Promise<boolean>
  isUpdating: boolean
}

export function ProfileForm({ user, onSubmit, isUpdating }: ProfileFormProps) {
  const [name, setName] = useState(user.name)
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [hasChanges, setHasChanges] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    setHasChanges(value !== user.name)
    // Clear error when user types
    if (errors.name) {
      setErrors({})
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    try {
      updateProfileSchema.parse({ name })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { name?: string } = {}
        error.issues.forEach((err) => {
          if (err.path[0] === 'name') {
            formattedErrors.name = err.message
          }
        })
        setErrors(formattedErrors)
        return
      }
    }

    // Submit
    const success = await onSubmit(name)
    if (success) {
      setHasChanges(false)
    }
  }

  const handleCancel = () => {
    setName(user.name)
    setHasChanges(false)
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Nome"
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name}
          placeholder="Enter your full name"
          disabled={isUpdating}
          helperText="Este nome será exibido nas classificacoes e apostas"
        />

        <Input
          label="Email"
          type="email"
          value={user.email}
          disabled
          helperText="Email nao pode ser alterado"
        />
      </div>

      {hasChanges && (
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={isUpdating}
            className="flex-1"
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  )
}
