'use client'

import { TeamPrediction } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import { useState } from 'react'

export default function SortableTableRow({
  pred,
  index,
  getPositionColor,
  getPositionBadge,
  moveTeam,
  predictionsLength,
}: {
  pred: TeamPrediction
  index: number
  getPositionColor: (position: number) => string
  getPositionBadge: (position: number) => { text: string; color: string }
  moveTeam: (index: number, direction: 'up' | 'down') => void
  predictionsLength: number
}) {
  const [imgSrc, setImgSrc] = useState(pred.shieldUrl)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pred.teamId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const badge = getPositionBadge(pred.position)

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 hover:shadow-md ${getPositionColor(pred.position)} ${
        isDragging ? 'ring-primary-500 shadow-2xl ring-2' : ''
      }`}
    >
      {/* Drag Handle */}
      <td className="px-3 py-4">
        <div
          {...attributes}
          {...listeners}
          className="flex cursor-grab items-center justify-center text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          title="Arraste para reordenar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      </td>

      {/* Position */}
      <td className="px-6 py-4">
        <div className="flex items-center text-center">
          <span className="w-8 text-2xl font-bold text-gray-700">
            {pred.position}
          </span>
        </div>
      </td>

      {/* Team Name and Logo */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          {imgSrc && (
            <Image
              src={imgSrc}
              alt={pred.teamName}
              width={32}
              height={32}
              className="mr-3 object-contain"
              onError={() => setImgSrc(undefined)}
            />
          )}
          <span className="text-lg font-semibold text-gray-900">
            {pred.teamName}
          </span>
        </div>
      </td>

      {/* Move Buttons (kept as alternative to drag) */}
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => moveTeam(index, 'up')}
            disabled={index === 0}
            className="bg-primary-500 hover:bg-primary-600 rounded-lg p-2 text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30"
            title="Mover para cima"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => moveTeam(index, 'down')}
            disabled={index === predictionsLength - 1}
            className="bg-primary-500 hover:bg-primary-600 rounded-lg p-2 text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30"
            title="Mover para baixo"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
