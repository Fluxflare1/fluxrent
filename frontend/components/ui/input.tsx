import React, { forwardRef, InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
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

Input.displayName = "Input";
export default Input;
