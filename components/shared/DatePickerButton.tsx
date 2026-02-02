'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// ============================================================================
// CONSTANTS
// ============================================================================

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

// ============================================================================
// COMPONENT
// ============================================================================

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

  // Temporary date while picker is open
  const [tempDate, setTempDate] = useState<Date>(value)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle date selection from calendar
   * Only updates temp date, doesn't close popover
   */
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve current time when selecting a new date
      const newDate = new Date(selectedDate)
      newDate.setHours(tempDate.getHours())
      newDate.setMinutes(tempDate.getMinutes())
      newDate.setSeconds(0)
      newDate.setMilliseconds(0)

      setTempDate(newDate)
    }
  }

  /**
   * Handle time change (hours or minutes)
   */
  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newDate = new Date(tempDate)

    if (type === 'hour') {
      newDate.setHours(value)
    } else {
      newDate.setMinutes(value)
    }

    setTempDate(newDate)
  }

  /**
   * Confirm and apply the selected date
   */
  const handleConfirm = () => {
    onChange(tempDate)
    setIsOpen(false)
  }

  /**
   * Cancel and close picker
   */
  const handleCancel = () => {
    setTempDate(value) // Reset to original value
    setIsOpen(false)
  }

  /**
   * When popover opens, sync temp date with current value
   */
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempDate(value)
    }
    setIsOpen(open)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-10 w-fit justify-start px-4 text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value
            ? format(value, 'dd/MM/yyyy HH:mm', { locale: ptBR })
            : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          {/* Calendar and Time Selectors */}
          <div className="flex flex-col sm:flex-row">
            {/* Calendar */}
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

            {/* Time Selectors */}
            <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
              {/* Hours */}
              <ScrollArea className="w-full sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {HOURS.map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        tempDate.getHours() === hour ? 'default' : 'ghost'
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() => handleTimeChange('hour', hour)}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>

              {/* Minutes */}
              <ScrollArea className="w-full sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {MINUTES.map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        tempDate.getMinutes() === minute ? 'default' : 'ghost'
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() => handleTimeChange('minute', minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 border-t p-3">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              variant="default"
              className="flex-1"
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
