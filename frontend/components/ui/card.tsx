// frontend/components/ui/card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white text-gray-900 shadow-soft",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return (
    <div className={cn("px-4 py-3 border-b border-gray-100", className)} {...props} />
  );
}

function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn("px-4 py-3 border-t border-gray-100", className)} {...props} />
  );
}

export { Card, CardHeader, CardContent, CardFooter };
