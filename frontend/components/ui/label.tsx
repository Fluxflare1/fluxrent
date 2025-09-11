import * as React from "react";

export const Label: React.FC<{
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ htmlFor, className = "", children }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
  >
    {children}
  </label>
);
