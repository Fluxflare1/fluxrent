import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`px-4 py-2 rounded-md font-medium ${
          variant === 'default' ? 'bg-blue-600 text-white' :
          variant === 'destructive' ? 'bg-red-600 text-white' :
          variant === 'outline' ? 'border border-gray-300' :
          variant === 'secondary' ? 'bg-gray-200 text-gray-900' :
          variant === 'ghost' ? 'hover:bg-gray-100' :
          variant === 'link' ? 'text-blue-600 underline' : ''
        } ${
          size === 'sm' ? 'text-sm px-3 py-1' :
          size === 'lg' ? 'text-lg px-6 py-3' :
          size === 'icon' ? 'p-2' : ''
        } ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
