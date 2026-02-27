import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lap } from '../types';
import { haptic } from '../services/hapticService';
import { useResponsive } from '../hooks/useResponsive';

interface StopwatchProps {
  hapticsEnabled: boolean;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ hapticsEnabled }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const { scale, isLandscape } = useResponsive();

  const updateStopwatch = () => {
    if (isRunning) {
      setTime(Date.now() - startTimeRef.current);
      requestRef.current = requestAnimationFrame(updateStopwatch);
    }
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      requestRef.current = requestAnimationFrame(updateStopwatch);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return {
      main: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      ms: milliseconds.toString().padStart(2, '0'),
    };
  };

  const handleStartPause = () => {
    if (hapticsEnabled) haptic.medium();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (hapticsEnabled) haptic.heavy();
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (hapticsEnabled) haptic.light();
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const newLap: Lap = {
      id: Date.now().toString(),
      time: time,
      lapTime: time - lastLapTime,
    };
    setLaps([newLap, ...laps]);
  };

  const { main, ms } = formatTime(time);

  return (
    <div className="flex flex-col h-full horizontal-padding safe-area-top safe-area-bottom w-full max-w-[1000px] mx-auto overflow-hidden">
      {/* Top Spacer to balance the lap list and keep the timer centered */}
      <div className="flex-1 min-h-0" />

      <div className={`flex ${isLandscape ? 'flex-row' : 'flex-col'} items-center justify-center flex-none py-6 gap-8 md:gap-12`}>
        <div className="flex items-baseline digital-mono">
          <motion.span 
            style={{ fontSize: (isLandscape ? 64 : 56) * scale }}
            animate={isRunning ? { opacity: [1, 0.8, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-bold tracking-tighter text-text tabular-nums text-glow"
          >
            {main}
          </motion.span>
          <span 
            style={{ fontSize: (isLandscape ? 24 : 20) * scale, marginLeft: 6 * scale }}
            className="font-bold text-secondary tabular-nums"
          >
            .{ms}
          </span>
        </div>

        <div 
          style={{ 
            gap: 10 * scale, 
            marginTop: isLandscape ? 0 : 16 * scale,
            flexDirection: isLandscape ? 'column' : 'row'
          }}
          className="flex items-center"
        >
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleReset}
              style={{ height: 40 * scale, width: isLandscape ? 90 * scale : 'auto', paddingLeft: 12 * scale, paddingRight: 12 * scale, borderRadius: 10 * scale }}
              className="bg-divider text-text font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw size={14 * scale} />
              {(!isLandscape || scale > 1) && <span style={{ fontSize: 13 * scale }}>Reset</span>}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLap}
              disabled={!isRunning}
              style={{ height: 40 * scale, width: isLandscape ? 90 * scale : 'auto', paddingLeft: 12 * scale, paddingRight: 12 * scale, borderRadius: 10 * scale }}
              className="bg-divider text-text font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Flag size={14 * scale} />
              {(!isLandscape || scale > 1) && <span style={{ fontSize: 13 * scale }}>Lap</span>}
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStartPause}
            style={{ height: 48 * scale, width: isLandscape ? 180 * scale : 120 * scale, borderRadius: 12 * scale }}
            className={`font-bold flex items-center justify-center gap-2 accent-glow ${
              isRunning 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-accent text-white'
            }`}
          >
            {isRunning ? <Pause size={16 * scale} /> : <Play size={16 * scale} />}
            <span style={{ fontSize: 15 * scale }}>{isRunning ? 'Pause' : 'Start'}</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom section for laps, balanced by the top spacer */}
      <div className="flex-1 overflow-y-auto mt-4 border-t border-divider min-h-0">
        <AnimatePresence initial={false}>
          {laps.length > 0 ? (
            laps.map((lap, index) => {
              const { main: lMain, ms: lMs } = formatTime(lap.lapTime);
              return (
                <motion.div
                  key={lap.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between py-4 border-b border-divider"
                >
                  <span 
                    style={{ fontSize: 12 * scale }}
                    className="text-secondary font-bold digital-mono uppercase"
                  >
                    Lap {laps.length - index}
                  </span>
                  <span 
                    style={{ fontSize: 16 * scale }}
                    className="text-text font-bold tabular-nums digital-mono"
                  >
                    {lMain}.{lMs}
                  </span>
                </motion.div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-secondary opacity-20 select-none">
              <Flag size={48 * scale} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
