'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from 'utils';

function IconButton({
  icon: Icon,
  className,
  href,
  target,
  color = [255, 255, 255], // Default to white
  rippleColor = [255, 255, 255], // Separate ripple color, default white
  size = 24, // Default icon size
  ...props
}) {
  const [ripples, setRipples] = React.useState([]);
  const buttonRef = React.useRef(null);

  const createRipple = React.useCallback((event) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = React.useCallback((event) => {
    createRipple(event);
  }, [createRipple]);

  const buttonContent = (
    <motion.button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden cursor-pointer inline-flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10',
        className
      )}
      style={{
        width: size + 16, // Add padding around icon
        height: size + 16,
        color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      {...props}
    >
      <Icon 
        style={{ 
          fontSize: size,
          width: size,
          height: size 
        }} 
      />
      
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              top: ripple.y - 10,
              left: ripple.x - 10,
              width: 20,
              height: 20,
              backgroundColor: `rgba(${rippleColor[0]}, ${rippleColor[1]}, ${rippleColor[2]}, 0.2)`,
            }}
            initial={{ scale: 0, opacity: 0.4 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );

  // If href is provided, wrap in a link
  if (href) {
    return (
      <a href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined}>
        {buttonContent}
      </a>
    );
  }

  return buttonContent;
}

export { IconButton }; 