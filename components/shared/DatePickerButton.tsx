'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerButtonProps {
  value: Date
  onChange: (date: Date) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
}

export default function DatePickerButton({
  value,
  onChange,
  placeholder = 'Selecione data e hora',
  minDate,
  maxDate,
  disabled = false,
}: DatePickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(value)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(tempDate.getHours())
      newDate.setMinutes(tempDate.getMinutes())
      newDate.setSeconds(0)
      newDate.setMilliseconds(0)
      setTempDate(newDate)
    }
  }

  const adjustTime = (type: 'hour' | 'minute', direction: 'up' | 'down') => {
    const newDate = new Date(tempDate)

    if (type === 'hour') {
      const currentHour = newDate.getHours()
      const newHour =
        direction === 'up'
          ? (currentHour + 1) % 24
          : (currentHour - 1 + 24) % 24
      newDate.setHours(newHour)
    } else {
      const currentMinute = newDate.getMinutes()
      const newMinute =
        direction === 'up'
          ? (currentMinute + 1) % 60
          : (currentMinute - 1 + 60) % 60
      newDate.setMinutes(newMinute)
    }

    setTempDate(newDate)
  }

  const handleTimeInput = (type: 'hour' | 'minute', value: string) => {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return

    const newDate = new Date(tempDate)

    if (type === 'hour' && numValue >= 0 && numValue < 24) {
      newDate.setHours(numValue)
      setTempDate(newDate)
    } else if (type === 'minute' && numValue >= 0 && numValue < 60) {
      newDate.setMinutes(numValue)
      setTempDate(newDate)
    }
  }

  const handleConfirm = () => {
    onChange(tempDate)
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempDate(value)
    }
    setIsOpen(open)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-12 w-full justify-start gap-2 px-4 text-left font-normal',
            'sm:w-auto',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="h-5 w-5 flex-shrink-0" />
          <span className="text-base">
            {value
              ? format(value, 'dd/MM/yyyy HH:mm', { locale: ptBR })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="center" side="bottom">
        <div className="flex flex-col">
          {/* Calendar Section */}
          <div className="border-b">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
              locale={ptBR}
              initialFocus
            />
          </div>

          {/* Time Picker Section */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-3">
              {/* Hours Control */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={() => adjustTime('hour', 'up')}
                  aria-label="Incrementar hora"
                >
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                </Button>

                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={tempDate.getHours().toString().padStart(2, '0')}
                  onChange={(e) => handleTimeInput('hour', e.target.value)}
                  className="h-12 w-12 border-0 bg-transparent text-center text-4xl font-bold focus-visible:ring-0"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={() => adjustTime('hour', 'down')}
                  aria-label="Decrementar hora"
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              {/* Separator */}
              <div className="text-2xl font-bold text-gray-400">:</div>

              {/* Minutes Control */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={() => adjustTime('minute', 'up')}
                  aria-label="Incrementar minuto"
                >
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                </Button>

                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={tempDate.getMinutes().toString().padStart(2, '0')}
                  onChange={(e) => handleTimeInput('minute', e.target.value)}
                  className="h-12 w-12 border-0 bg-transparent text-center text-4xl font-bold focus-visible:ring-0"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={() => adjustTime('minute', 'down')}
                  aria-label="Decrementar minuto"
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="border-t p-3">
            <Button
              variant="default"
              type="button"
              className="w-full bg-primary-700 py-6 text-base font-medium text-white hover:bg-gray-800"
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
