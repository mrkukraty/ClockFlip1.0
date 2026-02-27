import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Monitor, Clock, Layout, Timer, Bell, Volume2 } from 'lucide-react';
import { Settings as SettingsType, Theme, ClockStyle } from '../types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  updateSettings: (newSettings: Partial<SettingsType>) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-bg rounded-t-[20px] z-50 max-h-[90vh] overflow-y-auto border-t border-divider"
            >
              <div className="horizontal-padding py-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[20px] font-semibold text-text">Settings</h2>
                  <button onClick={onClose} className="p-2 rounded-full bg-divider text-secondary">
                    <X size={20} />
                  </button>
                </div>

              <div className="space-y-8 pb-12">
                {/* Theme */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-secondary">
                    <Monitor size={18} />
                    <h3 className="text-[14px] font-semibold uppercase tracking-wider">Themes</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'obsidian', label: 'Obsidian Glass', bg: '#000000', accent: '#0A84FF' },
                      { id: 'arctic', label: 'Arctic Minimal', bg: '#F8F8F8', accent: '#007AFF' },
                      { id: 'midnight', label: 'Midnight Neon', bg: '#0F0F14', accent: '#00F5FF' },
                      { id: 'forest', label: 'Forest Focus', bg: '#0F1A14', accent: '#2ECC71' },
                      { id: 'champagne', label: 'Champagne Gold', bg: '#FAF9F6', accent: '#C6A75E' },
                      { id: 'amoled-red', label: 'AMOLED Red', bg: '#000000', accent: '#FF3B30' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updateSettings({ theme: t.id as Theme })}
                        className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all ${
                          settings.theme === t.id
                            ? 'border-accent bg-accent/5'
                            : 'border-divider bg-card'
                        }`}
                      >
                        <div 
                          className="w-full h-12 rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-divider"
                          style={{ backgroundColor: t.bg }}
                        >
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.accent }} />
                        </div>
                        <span className={`text-[12px] font-medium ${settings.theme === t.id ? 'text-accent' : 'text-text'}`}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Custom Accent Color */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-secondary">
                    <Layout size={18} />
                    <h3 className="text-[14px] font-semibold uppercase tracking-wider">Custom Accent</h3>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-divider">
                    <input
                      type="color"
                      value={settings.customAccentColor || '#0A84FF'}
                      onChange={(e) => updateSettings({ customAccentColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-[14px] font-medium text-text">Accent Color</span>
                      <p className="text-[10px] text-secondary">Override theme accent color</p>
                    </div>
                    {settings.customAccentColor && (
                      <button 
                        onClick={() => updateSettings({ customAccentColor: undefined })}
                        className="text-[12px] text-accent font-medium"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </section>

                {/* Clock Style */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-secondary">
                    <Layout size={18} />
                    <h3 className="text-[14px] font-semibold uppercase tracking-wider">Clock Style</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(['modern', 'retro'] as ClockStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateSettings({ clockStyle: s })}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          settings.clockStyle === s
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-divider bg-card text-secondary'
                        }`}
                      >
                        <Clock size={20} />
                        <span className="mt-2 text-[12px] font-medium capitalize">{s}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Time Format */}
                <section>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-divider">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-secondary" />
                      <span className="font-medium text-text">24-Hour Format</span>
                    </div>
                    <button
                      onClick={() => updateSettings({ is24Hour: !settings.is24Hour })}
                      className={`w-[44px] h-[24px] rounded-full transition-colors relative ${
                        settings.is24Hour ? 'bg-accent' : 'bg-divider'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.is24Hour ? 22 : 2 }}
                        className="absolute top-[2px] left-0 w-[20px] h-[20px] bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </section>

                {/* Pomodoro */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-secondary">
                    <Timer size={18} />
                    <h3 className="text-[14px] font-semibold uppercase tracking-wider">Pomodoro</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { label: 'Focus', key: 'pomodoroDuration' },
                        { label: 'Short Break', key: 'shortBreakDuration' },
                        { label: 'Long Break', key: 'longBreakDuration' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-secondary font-medium">{item.label}</span>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => updateSettings({ [item.key]: Math.max(1, (settings as any)[item.key] - 1) })}
                              className="w-8 h-8 rounded-full bg-divider flex items-center justify-center text-text"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold text-text">{(settings as any)[item.key]}</span>
                            <button
                              onClick={() => updateSettings({ [item.key]: (settings as any)[item.key] + 1 })}
                              className="w-8 h-8 rounded-full bg-divider flex items-center justify-center text-text"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-semibold text-secondary uppercase tracking-wider mb-2">
                          Focus Message
                        </label>
                        <input
                          type="text"
                          value={settings.focusMessage}
                          onChange={(e) => updateSettings({ focusMessage: e.target.value })}
                          className="w-full p-3 rounded-xl bg-card text-text border border-divider focus:ring-2 focus:ring-accent outline-none"
                          placeholder="Stay Focused"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-secondary uppercase tracking-wider mb-2">
                          Focus Password (Optional)
                        </label>
                        <input
                          type="password"
                          value={settings.focusPassword || ''}
                          onChange={(e) => updateSettings({ focusPassword: e.target.value })}
                          className="w-full p-3 rounded-xl bg-card text-text border border-divider focus:ring-2 focus:ring-accent outline-none"
                          placeholder="No password"
                        />
                        <p className="mt-1 text-[10px] text-secondary">
                          If set, you'll need this to stop or change focus mode.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Haptics & Sound */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-divider">
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-secondary" />
                      <span className="font-medium text-text">Haptic Feedback</span>
                    </div>
                    <button
                      onClick={() => updateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
                      className={`w-[44px] h-[24px] rounded-full transition-colors relative ${
                        settings.hapticsEnabled ? 'bg-accent' : 'bg-divider'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.hapticsEnabled ? 22 : 2 }}
                        className="absolute top-[2px] left-0 w-[20px] h-[20px] bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-divider">
                    <div className="flex items-center gap-3">
                      <Volume2 size={20} className="text-secondary" />
                      <span className="font-medium text-text">Ambient Tick</span>
                    </div>
                    <button
                      onClick={() => updateSettings({ ambientTickEnabled: !settings.ambientTickEnabled })}
                      className={`w-[44px] h-[24px] rounded-full transition-colors relative ${
                        settings.ambientTickEnabled ? 'bg-accent' : 'bg-divider'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.ambientTickEnabled ? 22 : 2 }}
                        className="absolute top-[2px] left-0 w-[20px] h-[20px] bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
