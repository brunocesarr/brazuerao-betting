// components/bet-group-select-simple.tsx
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserBetGroup } from '@/types/domain' // Adjust import path

interface BetGroupSelectSimpleProps {
  groups: UserBetGroup[]
  value?: string
  onValueChange: (groupId: string) => void
  placeholder?: string
  disabled?: boolean
}

export function BetGroupSelectSimple({
  groups,
  value,
  onValueChange,
  placeholder = 'Clique e selecione um grupo',
  disabled = false,
}: BetGroupSelectSimpleProps) {
  return (
    <div className="w-full">
      <label className="mb-4 block text-md font-medium text-white">
        Selecione um grupo
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full h-10 px-4 bg-white text-center hover:cursor-pointer">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem
              key={group.groupId}
              value={group.groupId}
              className="hover:cursor-pointer"
            >
              {group.name}
              {group.isPrivate && ' 🔒'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
