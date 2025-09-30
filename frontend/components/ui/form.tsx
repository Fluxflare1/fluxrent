import React from "react";

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className = "",
  required = false,
}: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {children}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface FormProps {
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  className?: string;
}

export function Form({ onSubmit, children, className = "" }: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
      noValidate
    >
      {children}
    </form>
  );
}
