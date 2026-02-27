import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Clock as ClockIcon, Timer, Brain, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { Clock } from './components/Clock';
import { Stopwatch } from './components/Stopwatch';
import { Pomodoro } from './components/Pomodoro';
import { Settings } from './components/Settings';
import { Settings as SettingsType } from './types';
import { haptic } from './services/hapticService';
import { useResponsive } from './hooks/useResponsive';

const INITIAL_SETTINGS: SettingsType = {
  theme: 'obsidian',
  clockStyle: 'modern',
  is24Hour: true,
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  hapticsEnabled: true,
  ambientTickEnabled: false,
  focusMessage: 'Stay Focused',
};

type Tab = 'clock' | 'stopwatch' | 'pomodoro';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('clock');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { scale, isLandscape, screenHeight } = useResponsive();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  const [settings, setSettings] = useState<SettingsType>(() => {
    const saved = localStorage.getItem('clockflip_settings');
    const parsed = saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    // Ensure new fields are present
    return { ...INITIAL_SETTINGS, ...parsed };
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (settings.theme !== 'obsidian') return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  };

  useEffect(() => {
    localStorage.setItem('clockflip_settings', JSON.stringify(settings));
    
    const root = window.document.documentElement;
    
    // Remove all theme classes
    const themeClasses = ['theme-obsidian', 'theme-arctic', 'theme-midnight', 'theme-forest', 'theme-champagne', 'theme-amoled-red'];
    root.classList.remove(...themeClasses);
    
    // Add current theme class
    root.classList.add(`theme-${settings.theme}`);
    
    // Apply custom accent color if present
    if (settings.customAccentColor) {
      root.style.setProperty('--accent', settings.customAccentColor);
    } else {
      root.style.removeProperty('--accent');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<SettingsType>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleTabChange = (tab: Tab) => {
    if (settings.hapticsEnabled) haptic.light();
    setActiveTab(tab);
  };

  const handleOpenSettings = () => {
    if (settings.hapticsEnabled) haptic.light();
    setIsSettingsOpen(true);
  };

  const navHeight = Math.max(64, screenHeight * 0.08);

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden font-sans">
      {/* Header / Top Bar */}
      <header 
        style={{ height: 64 * scale }}
        className="safe-area-top horizontal-padding flex items-center justify-between z-10"
      >
        <span 
          style={{ fontSize: 18 * scale }}
          className="font-bold tracking-tight text-text digital-mono"
        >
          ClockFlip
        </span>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleOpenSettings}
            className="p-2 rounded-full text-secondary hover:bg-divider transition-colors"
          >
            <SettingsIcon size={22 * scale} />
          </motion.button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4"
          >
            {activeTab === 'clock' && (
              <Clock 
                style={settings.clockStyle} 
                is24Hour={settings.is24Hour} 
                hapticsEnabled={settings.hapticsEnabled}
              />
            )}
            {activeTab === 'stopwatch' && (
              <Stopwatch hapticsEnabled={settings.hapticsEnabled} />
            )}
            {activeTab === 'pomodoro' && (
              <Pomodoro 
                workDuration={settings.pomodoroDuration}
                shortBreakDuration={settings.shortBreakDuration}
                longBreakDuration={settings.longBreakDuration}
                hapticsEnabled={settings.hapticsEnabled}
                focusMessage={settings.focusMessage}
                focusPassword={settings.focusPassword}
                onMessageChange={(msg) => updateSettings({ focusMessage: msg })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <nav 
        style={{ height: navHeight }}
        className="safe-area-bottom bg-surface-light dark:bg-surface-dark border-t border-divider-light dark:border-divider-dark flex items-center justify-around z-10"
      >
        <TabButton 
          active={activeTab === 'clock'} 
          onClick={() => handleTabChange('clock')} 
          icon={<ClockIcon size={24 * scale} />} 
          scale={scale}
        />
        <TabButton 
          active={activeTab === 'stopwatch'} 
          onClick={() => handleTabChange('stopwatch')} 
          icon={<Timer size={24 * scale} />} 
          scale={scale}
        />
        <TabButton 
          active={activeTab === 'pomodoro'} 
          onClick={() => handleTabChange('pomodoro')} 
          icon={<Brain size={24 * scale} />} 
          scale={scale}
        />
      </nav>

      {/* Settings Modal */}
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  scale: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, scale }) => {
  return (
    <button
      onClick={onClick}
      style={{ minWidth: 80 * scale }}
      className={`flex flex-col items-center justify-center gap-1 transition-colors ${
        active ? 'text-accent-light dark:text-accent-dark' : 'text-secondary-light dark:text-secondary-dark'
      }`}
    >
      <motion.div
        animate={{ scale: active ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {icon}
      </motion.div>
    </button>
  );
}
