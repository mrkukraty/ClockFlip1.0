import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ClockStyle } from '../types';
import { FlipDigit } from './FlipDigit';
import { useResponsive } from '../hooks/useResponsive';

interface ClockProps {
  style: ClockStyle;
  is24Hour: boolean;
  hapticsEnabled: boolean;
}

export const Clock: React.FC<ClockProps> = ({ style, is24Hour, hapticsEnabled }) => {
  const [time, setTime] = useState(new Date());
  const requestRef = useRef<number>(0);
  const { scale, isLandscape } = useResponsive();

  const updateTime = () => {
    setTime(new Date());
    requestRef.current = requestAnimationFrame(updateTime);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const amPm = !is24Hour ? format(time, 'aa') : '';
  
  const hours = format(time, is24Hour ? 'HH' : 'hh');
  const minutes = format(time, 'mm');
  const seconds = format(time, 'ss');

  if (style === 'retro') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-full max-h-full overflow-hidden">
        <div className={`flex ${isLandscape ? 'scale-90' : 'scale-100'} gap-[8px] items-center justify-center w-full`}>
          <div className="flex gap-[4px]">
            <FlipDigit value={hours[0]} hapticsEnabled={hapticsEnabled} />
            <FlipDigit value={hours[1]} hapticsEnabled={hapticsEnabled} />
          </div>
          <span style={{ fontSize: 40 * scale }} className="font-bold text-secondary mb-2 digital-mono">:</span>
          <div className="flex gap-[4px]">
            <FlipDigit value={minutes[0]} hapticsEnabled={hapticsEnabled} />
            <FlipDigit value={minutes[1]} hapticsEnabled={hapticsEnabled} />
          </div>
          {!isLandscape && (
            <>
              <span style={{ fontSize: 40 * scale }} className="font-bold text-secondary mb-2 digital-mono">:</span>
              <div className="flex gap-[4px]">
                <FlipDigit value={seconds[0]} hapticsEnabled={hapticsEnabled} />
                <FlipDigit value={seconds[1]} hapticsEnabled={hapticsEnabled} />
              </div>
            </>
          )}
        </div>
        {!is24Hour && (
          <div 
            style={{ fontSize: 12 * scale, marginTop: 12 * scale }}
            className="font-bold text-secondary uppercase tracking-[0.2em] digital-mono"
          >
            {amPm}
          </div>
        )}
        <div 
          style={{ fontSize: 12 * scale, marginTop: 24 * scale }}
          className="text-secondary font-medium uppercase tracking-widest text-center"
        >
          {format(time, 'EEEE, MMMM do')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-full max-h-full overflow-hidden">
      <div className="flex items-baseline digital-mono flex-wrap justify-center">
        <h1 
          style={{ fontSize: (isLandscape ? 72 : 88) * scale, tracking: -4 * scale }}
          className="font-bold leading-none text-text text-glow"
        >
          {format(time, is24Hour ? 'HH:mm' : 'hh:mm')}
        </h1>
        <span 
          style={{ fontSize: (isLandscape ? 24 : 32) * scale, marginLeft: 8 * scale }}
          className="font-bold text-secondary"
        >
          {format(time, 'ss')}
        </span>
        {!is24Hour && (
          <span 
            style={{ fontSize: (isLandscape ? 18 : 24) * scale, marginLeft: 16 * scale }}
            className="font-bold text-secondary uppercase"
          >
            {amPm}
          </span>
        )}
      </div>
      <div 
        style={{ fontSize: 12 * scale, marginTop: 16 * scale }}
        className="text-secondary font-medium uppercase tracking-widest text-center"
      >
        {format(time, 'EEEE, MMMM do')}
      </div>
    </div>
  );
};
