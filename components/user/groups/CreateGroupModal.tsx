'use client'

import { Button } from '@/components/shared/Button'
import Checkbox from '@/components/shared/Checkbox'
import DatePickerButton from '@/components/shared/DatePickerButton'
import { Input } from '@/components/shared/Input'
import { RuleBet, UserBetGroup } from '@/types/domain'
import { Globe, Lock, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CreateGroupModalProps {
  rules: RuleBet[]
  isOpen: boolean
  onClose: () => void
  onCreateGroup: (
    group: Omit<
      UserBetGroup,
      'groupId' | 'userId' | 'roleGroupId' | 'requestStatusId'
    >,
    rules: string[]
  ) => void
}

export default function CreateGroupModal({
  rules,
  isOpen,
  onClose,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    challenge: '',
    isPrivate: false,
    deadlineAt: new Date(),
    allowPublicViewing: true,
    selectedRules: rules
      .filter((rule) => rule.isDefault)
      .map((rule) => rule.id),
  })

  useEffect(() => {
    setFormData({
      ...formData,
      selectedRules: rules.map((rule) => rule.id),
    })
  }, [rules])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateGroup(formData, formData.selectedRules)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      challenge: '',
      isPrivate: false,
      deadlineAt: new Date(),
      allowPublicViewing: true,
      selectedRules: rules
        .filter((rule) => rule.isDefault)
        .map((rule) => rule.id),
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-primary-900/10">
          <h2 className="text-xl font-semibold text-gray-900">
            Criar novo grupo
          </h2>
          <button
            onClick={handleClose}
            className="text-red-500/80 hover:text-gray-400 hover:cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Group Name */}
            <Input
              id="groupName"
              label="Nome do Grupo*"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Informe o nome do grupo"
              helperText="Este nome será exibido nas classificacoes e apostas"
            />

            {/* Challenge/Description */}
            <Input
              id="challenge"
              label="Prenda / Desafio "
              type="text"
              value={formData.challenge}
              onChange={(e) =>
                setFormData({ ...formData, challenge: e.target.value })
              }
              placeholder="Descreva a prenda / desafio que deve ser paga pelos perdedores"
            />

            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Data de encerramento das apostas*
              </label>
              <DatePickerButton
                value={formData.deadlineAt}
                onChange={(date) =>
                  setFormData({ ...formData, deadlineAt: date ?? new Date() })
                }
              />
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-4 mt-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {formData.isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : (
                  <Globe className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">Grupo Privado</p>
                  <p className="text-sm text-gray-600">
                    Somente membros aceitos podem participar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    isPrivate: !formData.isPrivate,
                    allowPublicViewing: formData.isPrivate,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isPrivate ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Public option */}
            {!formData.isPrivate && (
              <Checkbox
                id="allow-checkbox"
                label="Eu aceito que todos os usuário consigam visualizar a classificao."
                checked={formData.allowPublicViewing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allowPublicViewing: !formData.allowPublicViewing,
                  })
                }
              />
            )}

            {rules.length > 0 && (
              <div>
                <p className="mb-2 block text-sm font-medium text-gray-700">
                  Regras
                </p>
                {rules.map((rule: RuleBet, index) => (
                  <Checkbox
                    key={index}
                    id={`allow-rule-${index}`}
                    label={rule.description}
                    checked={formData.selectedRules.includes(rule.id)}
                    disabled
                    onChange={(e) => {
                      const isChecked = formData.selectedRules.includes(rule.id)
                      const newSelectedRules = isChecked
                        ? formData.selectedRules.filter(
                            (selectedRule) => selectedRule !== rule.id
                          )
                        : [...formData.selectedRules, rule.id]
                      setFormData({
                        ...formData,
                        selectedRules: newSelectedRules,
                      })
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" variant="danger" onClick={handleClose}>
              Cancelar
            </Button>
            <Button className="flex-1" type="submit" variant="primary">
              Criar grupo
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
