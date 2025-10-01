"use client"

import * as React from "react"
import { create } from "zustand"
import { cn } from "@/lib/utils"

type Toast = {
  id: string
  message: string
  type?: "success" | "error" | "info"
}

interface ToastStore {
  toasts: Toast[]
  add: (message: string, type?: Toast["type"]) => void
  remove: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = "info") => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function ToastContainer() {
  const { toasts, remove } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-md px-4 py-2 shadow-md text-white cursor-pointer",
            t.type === "success" && "bg-green-600",
            t.type === "error" && "bg-red-600",
            t.type === "info" && "bg-blue-600"
          )}
          onClick={() => remove(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
