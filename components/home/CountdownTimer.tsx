'use client'

import { useEffect, useState } from 'react'

export interface SimpleCountdownProps {
  targetDate?: Date
}
export default function SimpleCountdown({ targetDate }: SimpleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  })

  useEffect(() => {
    const target = targetDate ? targetDate.getTime() : new Date().getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const diff = target - now

      if (diff > 0) {
        setTimeLeft({
          dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
          horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((diff / 1000 / 60) % 60),
          segundos: Math.floor((diff / 1000) % 60),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="mb-12 flex flex-col items-center justify-center gap-6 rounded-xl bg-slate-950/10 p-8 backdrop-blur-sm">
      <p className="text-lg text-gray-400">
        Contagem regressiva para o começo do Brasileirão{' '}
        {new Date().getFullYear()}
      </p>
      <div className="grid grid-cols-2 gap-4 text-center md:flex">
        {Object.entries(timeLeft).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-white/10 p-6 backdrop-blur-sm"
          >
            <div className="text-5xl font-bold text-white">
              {String(value).padStart(2, '0')}
            </div>
            <div className="mt-2 text-sm text-gray-400 uppercase">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
