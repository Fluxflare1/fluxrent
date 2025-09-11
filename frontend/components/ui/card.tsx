import * as React from "react";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div className={`rounded-xl border bg-white shadow p-4 ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => <div className={`mb-2 font-semibold ${className}`}>{children}</div>;

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => <div className={className}>{children}</div>;
