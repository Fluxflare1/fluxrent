import * as React from "react";

interface TabsProps {
  tabs: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex border-b border-slate-200 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-sm ${
            value === tab.value
              ? "border-b-2 border-primary-500 font-medium text-primary-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
