"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export function DatePicker({ value, onChange }: { value?: Date; onChange?: (date?: Date) => void }) {
  return <DayPicker mode="single" selected={value} onSelect={onChange} />
}
