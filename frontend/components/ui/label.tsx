import React, { LabelHTMLAttributes } from "react";
import clsx from "clsx";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string;
};

export default function Label({ className, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={clsx(
        "block text-sm font-medium text-slate-700",
        className
      )}
    />
  );
}
