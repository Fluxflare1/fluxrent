"use client";

import * as React from "react";

interface DateRange {
  start: string;
  end: string;
}

interface DatePickerProps {
  onChange: (range: DateRange | null) => void;
}

export function DatePicker({ onChange }: DatePickerProps) {
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");

  React.useEffect(() => {
    if (start && end) {
      onChange({ start, end });
    } else {
      onChange(null);
    }
  }, [start, end]);

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      />
      <span>–</span>
      <input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      />
    </div>
  );
}
