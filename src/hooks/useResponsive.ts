import { useState, useEffect } from 'react';

export interface ResponsiveConfig {
  scale: number;
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
  isTablet: boolean;
}

export const useResponsive = (): ResponsiveConfig => {
  const [config, setConfig] = useState<ResponsiveConfig>({
    scale: 1,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight,
    isTablet: window.innerWidth >= 600,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Base design width = 390, height = 844 (iPhone 13/14)
      const scaleW = width / 390;
      const scaleH = height / 844;
      
      // In landscape, height is the primary constraint. 
      // We use a more conservative height scale to prevent vertical overflow.
      const isLandscape = width > height;
      let scale = isLandscape ? Math.min(scaleW * 0.8, scaleH * 1.2) : Math.min(scaleW, scaleH);
      
      // Clamp scale between 0.65 and 1.2 for better stability
      scale = Math.max(0.65, Math.min(1.2, scale));

      setConfig({
        scale,
        screenWidth: width,
        screenHeight: height,
        isLandscape,
        isTablet: width >= 600,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return config;
};
