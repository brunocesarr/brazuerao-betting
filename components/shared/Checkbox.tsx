'use client'

interface CheckboxProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export default function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 accent-primary-600 text-primary-600 bg-primary-100 border-primary-300 rounded focus:ring-primary-500 focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
      />
      <label
        htmlFor={id}
        className={`ml-2 text-sm font-medium text-gray-700 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {label}
      </label>
    </div>
  )
}
