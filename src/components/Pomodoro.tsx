import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptic } from '../services/hapticService';
import { useResponsive } from '../hooks/useResponsive';

interface PomodoroProps {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  hapticsEnabled: boolean;
  focusMessage: string;
  focusPassword?: string;
  onMessageChange: (message: string) => void;
}

type SessionType = 'work' | 'shortBreak' | 'longBreak';

export const Pomodoro: React.FC<PomodoroProps> = ({
  workDuration,
  shortBreakDuration,
  longBreakDuration,
  hapticsEnabled,
  focusMessage,
  focusPassword,
  onMessageChange,
}) => {
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<{
    type: 'stop' | 'reset' | 'change';
    targetSession?: SessionType;
  } | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const requestRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const { scale, isLandscape } = useResponsive();

  useEffect(() => {
    setTimeLeft(
      sessionType === 'work'
        ? workDuration * 60
        : sessionType === 'shortBreak'
        ? shortBreakDuration * 60
        : longBreakDuration * 60
    );
  }, [workDuration, shortBreakDuration, longBreakDuration, sessionType]);

  const updatePomodoro = (time: number) => {
    if (isRunning) {
      if (time - lastTickRef.current >= 1000) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
        lastTickRef.current = time;
      }
      requestRef.current = requestAnimationFrame(updatePomodoro);
    }
  };

  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updatePomodoro);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    if (hapticsEnabled) haptic.success();

    if ("Notification" in window) {
      if (Notification.permission === 'granted') {
        new Notification('ClockFlip', {
          body: sessionType === 'work' ? 'Time for a break!' : 'Time to focus!',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }

    if (sessionType === 'work') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      if (newCount % 4 === 0) {
        setSessionType('longBreak');
      } else {
        setSessionType('shortBreak');
      }
    } else {
      setSessionType('work');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const checkPassword = (action: () => void, type: 'stop' | 'reset' | 'change', targetSession?: SessionType) => {
    if (focusPassword && sessionType === 'work' && (isRunning || timeLeft < workDuration * 60)) {
      setShowPasswordPrompt({ type, targetSession });
      setPasswordInput('');
      setPasswordError(false);
    } else {
      action();
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === focusPassword) {
      const { type, targetSession } = showPasswordPrompt!;
      if (type === 'stop') setIsRunning(false);
      if (type === 'reset') performReset();
      if (type === 'change' && targetSession) setSessionType(targetSession);
      setShowPasswordPrompt(null);
    } else {
      setPasswordError(true);
      if (hapticsEnabled) haptic.heavy();
    }
  };

  const handleStartPause = () => {
    if (hapticsEnabled) haptic.medium();
    if (isRunning) {
      checkPassword(() => setIsRunning(false), 'stop');
    } else {
      setIsRunning(true);
    }
  };

  const performReset = () => {
    setIsRunning(false);
    setTimeLeft(
      sessionType === 'work'
        ? workDuration * 60
        : sessionType === 'shortBreak'
        ? shortBreakDuration * 60
        : longBreakDuration * 60
    );
  };

  const handleReset = () => {
    if (hapticsEnabled) haptic.heavy();
    checkPassword(performReset, 'reset');
  };

  const totalTime =
    sessionType === 'work'
      ? workDuration * 60
      : sessionType === 'shortBreak'
      ? shortBreakDuration * 60
      : longBreakDuration * 60;

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) : 0;
  
  // Responsive circle sizing
  const circleContainerSize = (isLandscape ? 180 : 220) * scale;
  const radius = (isLandscape ? 75 : 90) * scale;
  const strokeWidth = 6 * scale;
  const center = circleContainerSize / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className={`flex ${isLandscape ? 'flex-row' : 'flex-col'} h-full horizontal-padding safe-area-top safe-area-bottom items-center justify-center w-full max-w-[1000px] mx-auto overflow-hidden relative`}>
      {/* Password Prompt Overlay */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card p-6 rounded-2xl shadow-xl w-full max-w-[320px] border border-divider"
            >
              <h3 className="text-lg font-bold text-text mb-4">Enter Password</h3>
              <input
                type="password"
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className={`w-full p-3 rounded-xl bg-bg text-text border border-divider outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-500' : 'focus:ring-accent'}`}
                placeholder="Password"
              />
              {passwordError && <p className="text-red-500 text-xs mt-2">Incorrect password</p>}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordPrompt(null)}
                  className="flex-1 p-3 rounded-xl bg-divider text-text font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 p-3 rounded-xl bg-accent text-white font-semibold"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative flex items-center justify-center ${isLandscape ? 'w-1/2' : 'flex-none mb-4'}`}>
        <div 
          style={{ width: circleContainerSize, height: circleContainerSize }}
          className="relative flex items-center justify-center"
        >
          {/* Soft Glow under active timer */}
          {isRunning && (
            <div className="absolute inset-0 bg-accent/10 blur-[40px] -z-10 rounded-full" />
          )}
          
          {/* Progress Circle */}
          <svg 
            style={{ width: circleContainerSize, height: circleContainerSize }}
            className="absolute inset-0 -rotate-90" 
            viewBox={`0 0 ${circleContainerSize} ${circleContainerSize}`}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-divider"
            />
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.5, ease: "linear" }}
              strokeLinecap="round"
              className="text-accent"
            />
          </svg>

          <div className="flex flex-col items-center z-10">
            <motion.span 
              style={{ fontSize: (isLandscape ? 40 : 48) * scale }}
              animate={isRunning ? { opacity: [1, 0.8, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-bold tracking-tighter text-text tabular-nums digital-mono text-glow"
            >
              {formatTime(timeLeft)}
            </motion.span>
            <span 
              style={{ fontSize: 10 * scale, tracking: 0.2 * scale + 'em', marginTop: -2 * scale }}
              className="font-bold text-secondary uppercase digital-mono"
            >
              {sessionType === 'work' ? 'Focus' : 'Break'}
            </span>
          </div>
        </div>
      </div>

      <div className={`flex flex-col items-center justify-center ${isLandscape ? 'w-1/2 ml-4' : 'flex-none mt-2'}`}>
        {sessionType === 'work' && (
          <div className="flex flex-col items-center mb-4">
            {isEditingMessage ? (
              <input
                autoFocus
                type="text"
                value={focusMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                onBlur={() => setIsEditingMessage(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingMessage(false)}
                style={{ fontSize: 14 * scale, width: 200 * scale }}
                className="bg-card text-text font-medium italic text-center p-2 rounded-lg border border-divider outline-none focus:ring-2 focus:ring-accent"
              />
            ) : (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setIsEditingMessage(true)}
                style={{ fontSize: 14 * scale }}
                className="text-text font-medium italic text-center max-w-[200px] cursor-pointer hover:opacity-70 transition-opacity"
              >
                "{focusMessage}"
              </motion.p>
            )}
          </div>
        )}

        <div 
          style={{ gap: 6 * scale }}
          className="flex"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{ width: 6 * scale, height: 6 * scale }}
              className={`rounded-full transition-colors duration-300 ${
                i < (sessionsCompleted % 4)
                  ? 'bg-accent'
                  : 'bg-divider'
              }`}
            />
          ))}
        </div>

        <div 
          style={{ gap: 12 * scale, marginTop: isLandscape ? 24 * scale : 32 * scale }}
          className="flex"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleReset}
            style={{ height: 40 * scale, paddingLeft: 16 * scale, paddingRight: 16 * scale, borderRadius: 12 * scale }}
            className="bg-divider text-text font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw size={16 * scale} />
            <span style={{ fontSize: 14 * scale }}>Reset</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStartPause}
            style={{ height: 40 * scale, paddingLeft: 16 * scale, paddingRight: 16 * scale, borderRadius: 12 * scale, minWidth: 100 * scale }}
            className={`font-bold flex items-center justify-center gap-2 accent-glow ${
              isRunning 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-accent text-white'
            }`}
          >
            {isRunning ? <Pause size={16 * scale} /> : <Play size={16 * scale} />}
            <span style={{ fontSize: 14 * scale }}>{isRunning ? 'Pause' : 'Start'}</span>
          </motion.button>
        </div>

        <div 
          style={{ gap: 12 * scale, marginTop: 24 * scale }}
          className="flex"
        >
          <button
            onClick={() => {
              if (hapticsEnabled) haptic.light();
              checkPassword(() => setSessionType('work'), 'change', 'work');
            }}
            style={{ padding: 10 * scale, borderRadius: 10 * scale }}
            className={`transition-colors ${
              sessionType === 'work' ? 'bg-accent/10 text-accent' : 'text-secondary'
            }`}
          >
            <Brain size={18 * scale} />
          </button>
          <button
            onClick={() => {
              if (hapticsEnabled) haptic.light();
              checkPassword(() => setSessionType('shortBreak'), 'change', 'shortBreak');
            }}
            style={{ padding: 10 * scale, borderRadius: 10 * scale }}
            className={`transition-colors ${
              sessionType === 'shortBreak' ? 'bg-accent/10 text-accent' : 'text-secondary'
            }`}
          >
            <Coffee size={18 * scale} />
          </button>
          <button
            onClick={() => {
              if (hapticsEnabled) haptic.light();
              checkPassword(() => setSessionType('longBreak'), 'change', 'longBreak');
            }}
            style={{ padding: 10 * scale, borderRadius: 10 * scale }}
            className={`transition-colors ${
              sessionType === 'longBreak' ? 'bg-accent/10 text-accent' : 'text-secondary'
            }`}
          >
            <Timer size={18 * scale} />
          </button>
        </div>
      </div>
    </div>
  );
};
