"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Dialog({ open, onClose, children, className }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full z-10",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
