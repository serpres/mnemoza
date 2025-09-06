import { motion } from 'framer-motion'
import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  fullWidth?: boolean
  animate?: boolean
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg',
  warning: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg',
  ghost: 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30',
  outline: 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  fullWidth = false,
  animate = true,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading

  const buttonClasses = [
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'cursor-pointer',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ')

  const { onDrag, onDragEnd, onDragStart, onAnimationStart, onAnimationEnd, ...buttonProps } = props

  if (animate) {
    return (
      <motion.button
        className={buttonClasses}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.1 }}
        {...buttonProps}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            {typeof children === 'string' ? 'Загрузка...' : children}
          </>
        ) : (
          <>
            {icon && icon}
            {children}
          </>
        )}
      </motion.button>
    )
  }

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onAnimationStart={onAnimationStart}
      onAnimationEnd={onAnimationEnd}
      {...buttonProps}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          {typeof children === 'string' ? 'Загрузка...' : children}
        </>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
    </button>
  )
}
