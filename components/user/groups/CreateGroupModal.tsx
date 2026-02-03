'use client'

import { Button } from '@/components/shared/Button'
import Checkbox from '@/components/shared/Checkbox'
import DatePickerButton from '@/components/shared/DatePickerButton'
import { Input } from '@/components/shared/Input'
import { RuleBet, UserBetGroup } from '@/types/domain'
import { Globe, Lock, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface GroupFormData {
  name: string
  challenge: string
  isPrivate: boolean
  deadlineAt: Date
  allowPublicViewing: boolean
  selectedRules: string[]
}

interface CreateEditGroupModalProps {
  rules: RuleBet[]
  isOpen: boolean
  mode: 'create' | 'edit'
  existingGroup?: UserBetGroup
  onClose: () => void
  onSubmit: (
    group: Omit<
      UserBetGroup,
      'groupId' | 'userId' | 'roleGroupId' | 'requestStatusId'
    >,
    rules: string[]
  ) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CreateEditGroupModal({
  rules,
  isOpen,
  mode = 'create',
  existingGroup,
  onClose,
  onSubmit,
}: CreateEditGroupModalProps) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof GroupFormData, string>>
  >({})

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  /**
   * Get default selected rules (memoized)
   */
  const defaultRules = useMemo(
    () => rules.filter((rule) => rule.isDefault).map((rule) => rule.id),
    [rules]
  )

  /**
   * Get initial form data based on mode
   */
  const initialFormData = useMemo((): GroupFormData => {
    if (mode === 'edit' && existingGroup) {
      return {
        name: existingGroup.name,
        challenge: existingGroup.challenge ?? '',
        isPrivate: existingGroup.isPrivate,
        deadlineAt: new Date(existingGroup.deadlineAt),
        allowPublicViewing: existingGroup.allowPublicViewing,
        selectedRules: defaultRules,
      }
    }

    return {
      name: '',
      challenge: '',
      isPrivate: false,
      deadlineAt: new Date(),
      allowPublicViewing: true,
      selectedRules: defaultRules,
    }
  }, [mode, existingGroup, defaultRules])

  const [formData, setFormData] = useState<GroupFormData>(initialFormData)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Reset form when modal opens/closes or mode changes
   * Using requestAnimationFrame to defer state updates
   */
  useEffect(() => {
    if (isOpen) {
      // Defer state update to avoid cascading renders
      requestAnimationFrame(() => {
        setFormData(initialFormData)
        setErrors({})
      })
    }
  }, [isOpen, initialFormData])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof GroupFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do grupo é obrigatório'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres'
    }

    if (mode === 'create' && formData.deadlineAt <= new Date()) {
      newErrors.deadlineAt = 'Data de encerramento deve ser no futuro'
    }

    if (formData.challenge && formData.challenge.length > 500) {
      newErrors.challenge = 'Desafio deve ter no máximo 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, mode])

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const groupData = {
      name: formData.name.trim(),
      challenge: formData.challenge.trim() || null,
      isPrivate: formData.isPrivate,
      deadlineAt: formData.deadlineAt,
      allowPublicViewing: formData.allowPublicViewing,
    }

    onSubmit(groupData, formData.selectedRules)
    handleClose()
  }

  /**
   * Close modal and reset form
   */
  const handleClose = () => {
    setFormData(initialFormData)
    setErrors({})
    onClose()
  }

  /**
   * Toggle privacy setting
   */
  const handleTogglePrivacy = () => {
    setFormData((prev) => ({
      ...prev,
      isPrivate: !prev.isPrivate,
      allowPublicViewing: !prev.isPrivate ? true : prev.allowPublicViewing,
    }))
  }

  /**
   * Toggle rule selection
   */
  const handleRuleToggle = (ruleId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedRules: prev.selectedRules.includes(ruleId)
        ? prev.selectedRules.filter((id) => id !== ruleId)
        : [...prev.selectedRules, ruleId],
    }))
  }

  /**
   * Update form field
   */
  const updateField = <K extends keyof GroupFormData>(
    field: K,
    value: GroupFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null

  const isEditMode = mode === 'edit'
  const modalTitle = isEditMode ? 'Editar Grupo' : 'Criar Novo Grupo'
  const submitButtonText = isEditMode ? 'Salvar Alterações' : 'Criar Grupo'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-primary-700 p-6">
          <h2 className="text-xl font-semibold text-white">{modalTitle}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-white transition-colors hover:text-red-300"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="space-y-5 overflow-y-auto p-6">
            {/* Group Name */}
            <div>
              <Input
                id="groupName"
                label="Nome do Grupo*"
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ex: Liga dos Amigos 2026"
                helperText={
                  errors.name ||
                  'Este nome será exibido nas classificações e apostas'
                }
                error={errors.name}
                required
                maxLength={100}
              />
            </div>

            {/* Challenge/Description */}
            <div>
              <label
                htmlFor="challenge"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Prenda / Desafio
              </label>
              <textarea
                id="challenge"
                value={formData.challenge}
                onChange={(e) => updateField('challenge', e.target.value)}
                placeholder="Descreva a prenda ou desafio que deve ser paga pelos perdedores..."
                className={`w-full resize-none rounded-lg border px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary-500 ${
                  errors.challenge ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                maxLength={500}
              />
              {errors.challenge ? (
                <p className="mt-1 text-sm text-red-600">{errors.challenge}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.challenge.length}/500 caracteres
                </p>
              )}
            </div>

            {/* Deadline */}
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Data de Encerramento das Apostas*
              </label>
              <DatePickerButton
                value={formData.deadlineAt}
                onChange={(date) => updateField('deadlineAt', date)}
                placeholder="Selecione a data"
                minDate={
                  mode === 'create' ? new Date() : new Date(formData.deadlineAt)
                }
                maxDate={new Date(`${new Date().getFullYear()}-12-31`)}
              />
              {errors.deadlineAt && (
                <p className="mt-1 text-sm text-red-600">{errors.deadlineAt}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Após esta data, não será possível enviar ou editar apostas
              </p>
            </div>

            {/* Privacy Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Configurações de Privacidade
              </h3>

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div className="flex items-center gap-3">
                  {formData.isPrivate ? (
                    <Lock className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Globe className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Grupo Privado</p>
                    <p className="text-sm text-gray-600">
                      {formData.isPrivate
                        ? 'Somente membros aceitos podem participar'
                        : 'Qualquer usuário pode solicitar entrada'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePrivacy}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    formData.isPrivate ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle privacy"
                  aria-pressed={formData.isPrivate}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Public Viewing Option */}
              {!formData.isPrivate && (
                <div className="ml-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Checkbox
                    id="allow-public-viewing"
                    label="Permitir que usuários não cadastrados visualizem a classificação do grupo"
                    checked={formData.allowPublicViewing}
                    onChange={() =>
                      updateField(
                        'allowPublicViewing',
                        !formData.allowPublicViewing
                      )
                    }
                  />
                </div>
              )}
            </div>

            {/* Rules Section */}
            {rules.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Regras do Grupo
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Selecione as regras que se aplicam a este grupo
                  </p>
                </div>
                <div className="space-y-2 pl-2">
                  {rules.map((rule: RuleBet) => (
                    <Checkbox
                      key={rule.id}
                      id={`rule-${rule.id}`}
                      label={rule.description}
                      checked={formData.selectedRules.includes(rule.id)}
                      disabled={rule.isDefault}
                      onChange={() => handleRuleToggle(rule.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="rounded-lg border border-primary-700 bg-primary-700/10 p-4">
              <p className="text-sm text-primary-800">
                <strong>💡 Dica:</strong>{' '}
                {isEditMode
                  ? 'Alterações serão aplicadas imediatamente ao salvar.'
                  : 'Você poderá editar essas configurações depois de criar o grupo.'}
              </p>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-6">
            <Button
              className="flex-1 border-red-700 text-red-900"
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button className="flex-1" type="submit" variant="primary">
              {submitButtonText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
