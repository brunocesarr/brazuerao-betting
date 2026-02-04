export function LoadingState(
  { message, className }: { message: string; className?: string } = {
    message: 'Carregando...',
    className: '',
  }
) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#1a1a1a] z-10 min-h-screen ${className}`}
    >
      <div className="text-center">
        <div className="border-primary-600 mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2"></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  )
}
