import { AnimatedNotFound } from '@/components/not-found/AnimatedNotFound'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Gol Perdido | Brazuerao',
  description: 'Esta página saiu do campo!',
}

export default function NotFound() {
  return <AnimatedNotFound />
}
