'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/shared/Button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-12 w-full justify-start gap-2 px-4 text-left font-normal',
            'sm:w-auto',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="h-5 w-5 flex-shrink-0 text-primary-700" />
          <span className="text-base">
            {value
              ? format(value, 'dd/MM/yyyy HH:mm', { locale: ptBR })
              : placeholder}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-4 rounded-lg">
        <DialogHeader className="flex items-center justify-center">
          <DialogTitle className="text-lg font-bold">{placeholder}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col no-scrollbar max-h-full overflow-y-auto">
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
              autoFocus
            />
          </div>

          {/* Time Picker Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-4">
              {/* Hours Control */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
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
                  size="sm"
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
                  size="sm"
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
                  size="sm"
                  className="hover:bg-gray-100"
                  onClick={() => adjustTime('minute', 'down')}
                  aria-label="Decrementar minuto"
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="items-center">
          <div className="flex flex-col items-center justiry-center w-full">
            <DialogClose
              className="min-w-full"
              disabled={
                minDate ? tempDate.getTime() < minDate.getTime() : false
              }
              asChild
            >
              <Button
                variant="primary"
                type="button"
                className="min-w-full bg-primary-700 text-base font-medium text-white hover:bg-primary-800"
                onClick={handleConfirm}
                disabled={
                  minDate ? tempDate.getTime() < minDate.getTime() : false
                }
              >
                Confirmar
              </Button>
            </DialogClose>
            {minDate && tempDate.getTime() < minDate.getTime() && (
              <p className="font-thin text-xs text-end mt-2 text-red-600">
                Selecione uma data maior que{' '}
                {minDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
