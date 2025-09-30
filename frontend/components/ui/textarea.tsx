import React, { forwardRef, TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={
          "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm " +
          "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 " +
          "disabled:opacity-50 " +
          className
        }
      />
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
