"use client"

export function Loader({ size = 24 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-transparent"
      style={{ width: size, height: size }}
    />
  )
}
