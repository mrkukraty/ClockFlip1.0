import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { haptic } from "../services/hapticService";
import { useResponsive } from "../hooks/useResponsive";

interface FlipDigitProps {
  value: string | number;
  hapticsEnabled?: boolean;
}

export const FlipDigit: React.FC<FlipDigitProps> = ({ value, hapticsEnabled = true }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [nextValue, setNextValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const { scale } = useResponsive();

  useEffect(() => {
    if (value !== nextValue) {
      setNextValue(value);
      setIsFlipping(true);
      if (hapticsEnabled) haptic.light();
      
      const timer = setTimeout(() => {
        setCurrentValue(value);
        setIsFlipping(false);
      }, 450);
      
      return () => clearTimeout(timer);
    }
  }, [value, nextValue, hapticsEnabled]);

  // Responsive dimensions
  // Base width 64, height 88 (approx 2:3)
  const width = 64 * scale;
  const height = 88 * scale;
  const fontSize = 48 * scale;
  const borderRadius = 12 * scale;
  const translateY = 22 * scale;

  return (
    <div 
      style={{ width, height }}
      className="relative perspective-1000 digital-mono"
    >
      {/* Static Background (Next Value) */}
      <div className="absolute inset-0 flex flex-col">
        <div 
          style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
          className="h-1/2 w-full bg-card border-b border-divider overflow-hidden flex items-end justify-center"
        >
          <span 
            style={{ fontSize, transform: `translateY(-${translateY}px)` }}
            className="font-bold leading-[0] text-text"
          >
            {nextValue}
          </span>
        </div>
        <div 
          style={{ borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }}
          className="h-1/2 w-full bg-card overflow-hidden flex items-start justify-center"
        >
          <span 
            style={{ fontSize, transform: `translateY(${translateY}px)` }}
            className="font-bold leading-[0] text-text"
          >
            {nextValue}
          </span>
        </div>
      </div>

      {/* Top Half Flipping Down */}
      <AnimatePresence>
        {isFlipping && (
          <motion.div
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            transition={{ duration: 0.225, ease: [0.645, 0.045, 0.355, 1] }}
            style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
            className="absolute top-0 left-0 w-full h-1/2 bg-card border-b border-divider overflow-hidden flex items-end justify-center origin-bottom backface-hidden z-20 shadow-xl"
          >
            <span 
              style={{ fontSize, transform: `translateY(-${translateY}px)` }}
              className="font-bold leading-[0] text-text"
            >
              {currentValue}
            </span>
            {/* Reflection Shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Half Flipping Down */}
      <AnimatePresence>
        {isFlipping && (
          <motion.div
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ delay: 0.225, duration: 0.225, ease: [0.645, 0.045, 0.355, 1] }}
            style={{ borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }}
            className="absolute bottom-0 left-0 w-full h-1/2 bg-card overflow-hidden flex items-start justify-center origin-top backface-hidden z-10 shadow-xl"
          >
            <span 
              style={{ fontSize, transform: `translateY(${translateY}px)` }}
              className="font-bold leading-[0] text-text"
            >
              {nextValue}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static Front (Current Value) */}
      {!isFlipping && (
        <div className="absolute inset-0 flex flex-col z-0">
          <div 
            style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
            className="h-1/2 w-full bg-card border-b border-divider overflow-hidden flex items-end justify-center"
          >
            <span 
              style={{ fontSize, transform: `translateY(-${translateY}px)` }}
              className="font-bold leading-[0] text-text"
            >
              {currentValue}
            </span>
            {/* Reflection Shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          </div>
          <div 
            style={{ borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }}
            className="h-1/2 w-full bg-card overflow-hidden flex items-start justify-center"
          >
            <span 
              style={{ fontSize, transform: `translateY(${translateY}px)` }}
              className="font-bold leading-[0] text-text"
            >
              {currentValue}
            </span>
          </div>
        </div>
      )}

      {/* Center Line Shadow */}
      <div className="absolute inset-0 flex items-center pointer-events-none z-30">
        <div className="w-full h-[1px] bg-black/20" />
      </div>
    </div>
  );
};
