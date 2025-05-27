'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';
import { cn } from 'utils';

type ShimmerBackgroundProps = React.HTMLAttributes<HTMLDivElement> & {
  transition?: Transition;
  intensity?: 'subtle' | 'medium' | 'strong';
  children?: React.ReactNode;
};

function ShimmerBackground({
  children,
  className,
  transition = { duration: 8, ease: 'easeInOut', repeat: Infinity },
  intensity = 'subtle',
  ...props
}: ShimmerBackgroundProps) {
  
  // Define intensity levels for the shimmer effect
  const intensityStyles = {
    subtle: 'from-transparent via-white/40 to-transparent',
    medium: 'from-transparent via-white/50 to-transparent', 
    strong: 'from-transparent via-white/60 to-transparent'
  };

  return (
    <div
      data-slot="shimmer-background"
      className={cn('relative size-full overflow-visible', className)}
      {...props}
    >
      {/* Animated shimmer overlay */}
      <motion.div
        className={cn(
          'absolute inset-0 bg-gradient-to-r bg-[length:150%_100%]',
          intensityStyles[intensity]
        )}
        animate={{
          backgroundPosition: ['-50% 0%', '150% 0%'],
        }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        style={{
          pointerEvents: 'none', // Allow clicks to pass through
          transform: 'rotate(-15deg) scale(1.5)',
          transformOrigin: 'center center',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export { ShimmerBackground, type ShimmerBackgroundProps }; 