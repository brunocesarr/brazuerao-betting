// components/ui/calendar.tsx
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DayPicker,
  type DayPickerProps,
  labelNext,
  labelPrevious,
  useNavigation,
} from 'react-day-picker'

export type CalendarProps = DayPickerProps

function CustomNav() {
  const { previousMonth, nextMonth, goToMonth } = useNavigation()

  return (
    <nav className="flex items-center justify-between absolute inset-x-0 z-10">
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'size-8 bg-transparent p-0 opacity-60 hover:opacity-100 border-0 hover:bg-slate-100 transition-all duration-200'
        )}
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        aria-label={labelPrevious(previousMonth)}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={cn(
          'size-8 bg-transparent p-0 opacity-60 hover:opacity-100 border-0 hover:bg-slate-100 transition-all duration-200'
        )}
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        aria-label={labelNext(nextMonth)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-5', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-4 w-full',
        month_caption:
          'flex justify-center pt-1 relative items-center mb-4 min-h-10',
        caption_label: 'text-base font-bold text-slate-900 tracking-tight',
        month_grid: 'w-full border-collapse mt-4',
        weekdays: 'grid grid-cols-7',
        weekday:
          'text-slate-500 font-medium text-[0.75rem] tracking-wide text-center py-2',
        week: 'grid grid-cols-7 mt-0.5',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-9 p-0 font-normal hover:bg-slate-100 transition-all duration-200 rounded-lg mx-auto'
        ),
        day: 'text-center p-0 relative flex items-center justify-center',
        selected:
          'bg-slate-900 text-white hover:bg-slate-800 focus:bg-slate-800 font-medium shadow-sm',
        today:
          'bg-slate-100 text-slate-900 font-semibold ring-2 ring-slate-300',
        outside: 'text-slate-400 opacity-50',
        disabled: 'text-slate-300 opacity-40',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Nav: CustomNav,
      }}
      hideNavigation
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
