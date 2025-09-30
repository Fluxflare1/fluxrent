import React, { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "outline";
  className?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50";

    const variants: Record<string, string> = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
    };

    return (
      <button
        ref={ref}
        {...props}
        className={`${base} ${variants[variant]} ${className}`}
      />
    );
  }
);

Button.displayName = "Button";
export default Button;
