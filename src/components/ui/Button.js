/**
 * Modern Button Component - 2025 Edition
 * 
 * Shadcn-inspired button with:
 * - Variant system with cva
 * - Framer Motion animations
 * - Icon support with Lucide
 * - Modern design patterns
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn, transitions } from '../../lib/utils';
import { useModernTheme } from '../../context/ModernThemeProvider';

// Button variants using CVA (Class Variance Authority)
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700",
        glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
        neo: "bg-background border-2 border-border shadow-neo hover:shadow-neo-hover",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  leftIcon,
  rightIcon,
  onClick,
  ...props
}, ref) => {
  const theme = useModernTheme();
  const shouldAnimate = theme.animations !== 'disabled';

  // Animation props for Framer Motion
  const animationProps = shouldAnimate ? {
    whileTap: { scale: 0.95 },
    whileHover: disabled || loading ? {} : { scale: 1.02 },
    transition: transitions.snappy,
  } : {};

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : false}
      animate={shouldAnimate ? { opacity: 1, scale: 1 } : false}
      transition={transitions.smooth}
    >
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    </motion.div>
  );

  // Button content with icons and loading state
  const ButtonContent = () => (
    <>
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && (
        <motion.span 
          className="mr-2"
          initial={shouldAnimate ? { opacity: 0, x: -10 } : false}
          animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
          transition={transitions.smooth}
        >
          {leftIcon}
        </motion.span>
      )}
      
      <motion.span
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={shouldAnimate ? { opacity: 1 } : false}
        transition={transitions.smooth}
      >
        {children}
      </motion.span>
      
      {!loading && rightIcon && (
        <motion.span 
          className="ml-2"
          initial={shouldAnimate ? { opacity: 0, x: 10 } : false}
          animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
          transition={transitions.smooth}
        >
          {rightIcon}
        </motion.span>
      )}
    </>
  );

  if (shouldAnimate) {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...animationProps}
        {...props}
      >
        <ButtonContent />
      </motion.button>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      <ButtonContent />
    </button>
  );
});

Button.displayName = "Button";

// Specialized button variants
export const IconButton = React.forwardRef(({ 
  icon, 
  'aria-label': ariaLabel, 
  ...props 
}, ref) => (
  <Button
    ref={ref}
    size="icon"
    aria-label={ariaLabel}
    {...props}
  >
    {icon}
  </Button>
));

IconButton.displayName = "IconButton";

export const LoadingButton = React.forwardRef(({ 
  loading, 
  children, 
  ...props 
}, ref) => (
  <Button
    ref={ref}
    loading={loading}
    disabled={loading}
    {...props}
  >
    {loading ? 'Loading...' : children}
  </Button>
));

LoadingButton.displayName = "LoadingButton";

export { Button, buttonVariants };