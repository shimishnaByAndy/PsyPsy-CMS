/**
 * Animated Components - 2025 Edition
 * 
 * Pre-built animated components using Framer Motion
 * Following 2025 animation patterns and best practices
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, animationVariants, transitions, prefersReducedMotion } from '../../lib/utils';

// Higher-order component to add motion to any component
export function withMotion(Component, defaultVariants = animationVariants.scaleIn) {
  return React.forwardRef(function MotionComponent(props, ref) {
    const { 
      variants = defaultVariants, 
      initial = "initial",
      animate = "animate",
      exit = "exit",
      transition = transitions.smooth,
      className,
      ...restProps 
    } = props;
    
    const shouldAnimate = !prefersReducedMotion();
    
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={shouldAnimate ? variants : undefined}
        initial={shouldAnimate ? initial : false}
        animate={shouldAnimate ? animate : false}
        exit={shouldAnimate ? exit : false}
        transition={shouldAnimate ? transition : undefined}
      >
        <Component {...restProps} />
      </motion.div>
    );
  });
}

// Animated container for staggered children
export function StaggerContainer({ 
  children, 
  className,
  variants = animationVariants.staggerContainer,
  ...props 
}) {
  return (
    <motion.div
      className={className}
      variants={!prefersReducedMotion() ? variants : undefined}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated item for use within StaggerContainer
export function StaggerItem({ 
  children, 
  className,
  variants = animationVariants.staggerItem,
  ...props 
}) {
  return (
    <motion.div
      className={className}
      variants={!prefersReducedMotion() ? variants : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ 
  children, 
  className,
  variants = animationVariants.pageTransition,
  ...props 
}) {
  return (
    <motion.div
      className={cn("w-full", className)}
      variants={!prefersReducedMotion() ? variants : undefined}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transitions.smooth}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated card with hover effects
export function AnimatedCard({ 
  children, 
  className,
  hover = true,
  ...props 
}) {
  const hoverProps = hover && !prefersReducedMotion() ? {
    whileHover: { 
      y: -4,
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    transition: transitions.smooth
  } : {};

  return (
    <motion.div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-md transition-shadow duration-300",
        className
      )}
      variants={!prefersReducedMotion() ? animationVariants.scaleIn : undefined}
      initial="initial"
      animate="animate"
      {...hoverProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated button with micro-interactions
export function AnimatedButton({ 
  children, 
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
    outline: "border border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500",
    ghost: "text-primary-500 hover:bg-primary-50 focus:ring-primary-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-md",
    lg: "px-6 py-3 text-base rounded-lg"
  };

  const animationProps = !prefersReducedMotion() ? {
    whileTap: { scale: 0.95 },
    whileHover: disabled ? {} : { scale: 1.05 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  } : {};

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Loading...
          </motion.div>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Animated modal/dialog
export function AnimatedModal({ 
  isOpen, 
  onClose, 
  children, 
  className,
  backdropClassName,
  ...props 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitions.fade}
        >
          {/* Backdrop */}
          <motion.div
            className={cn(
              "absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm",
              backdropClassName
            )}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal content */}
          <motion.div
            className={cn(
              "relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4",
              "max-h-[90vh] overflow-hidden",
              className
            )}
            variants={!prefersReducedMotion() ? {
              initial: { opacity: 0, scale: 0.9, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.9, y: 20 }
            } : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitions.smooth}
            {...props}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animated notification/toast
export function AnimatedNotification({ 
  isVisible, 
  type = "info", 
  title, 
  message, 
  onClose,
  autoHide = true,
  duration = 5000 
}) {
  const [isShowing, setIsShowing] = React.useState(isVisible);

  React.useEffect(() => {
    setIsShowing(isVisible);
    
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, duration, onClose]);

  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          className={cn(
            "fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm",
            typeStyles[type]
          )}
          variants={!prefersReducedMotion() ? animationVariants.slideLeft : undefined}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transitions.smooth}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {title && (
                <h4 className="font-medium mb-1">{title}</h4>
              )}
              {message && (
                <p className="text-sm opacity-90">{message}</p>
              )}
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="ml-3 text-current opacity-50 hover:opacity-75"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animated loading spinner
export function AnimatedSpinner({ 
  size = "md", 
  className,
  ...props 
}) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <motion.div
      className={cn(
        "border-2 border-gray-200 border-t-primary-500 rounded-full",
        sizes[size],
        className
      )}
      animate={!prefersReducedMotion() ? { rotate: 360 } : undefined}
      transition={!prefersReducedMotion() ? {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      } : undefined}
      {...props}
    />
  );
}

// Animated progress bar
export function AnimatedProgress({ 
  value = 0, 
  max = 100, 
  className,
  showValue = false,
  ...props 
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)} {...props}>
      <motion.div
        className="bg-primary-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={transitions.smooth}
      />
      {showValue && (
        <div className="text-sm text-gray-600 mt-1">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

// Animated reveal on scroll
export function ScrollReveal({ 
  children, 
  className,
  threshold = 0.1,
  variants = animationVariants.slideUp,
  ...props 
}) {
  return (
    <motion.div
      className={className}
      variants={!prefersReducedMotion() ? variants : undefined}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: threshold }}
      transition={transitions.smooth}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated counter
export function AnimatedCounter({ 
  value, 
  duration = 1,
  format = (val) => Math.round(val),
  className,
  ...props 
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (!prefersReducedMotion()) {
      let start = 0;
      const end = value;
      const increment = end / (duration * 60); // Assuming 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(start);
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, duration]);

  return (
    <span className={className} {...props}>
      {format(displayValue)}
    </span>
  );
}

export default {
  withMotion,
  StaggerContainer,
  StaggerItem,
  PageTransition,
  AnimatedCard,
  AnimatedButton,
  AnimatedModal,
  AnimatedNotification,
  AnimatedSpinner,
  AnimatedProgress,
  ScrollReveal,
  AnimatedCounter
};