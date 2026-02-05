import { cn } from '@/lib/utils' // or your cn/clsx utility

export function LoadingState({
  message = 'Carregando...',
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-[#1a1a1a] z-10 min-h-screen',
        className
      )}
    >
      <div className="text-center">
        <div className="border-primary-600 mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2"></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  )
}
