import React, { forwardRef, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        {...props}
        className={
          "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm " +
          "focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 " +
          className
        }
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
export default Select;
