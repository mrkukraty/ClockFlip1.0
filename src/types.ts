export type Theme = 'obsidian' | 'arctic' | 'midnight' | 'forest' | 'champagne' | 'amoled-red';
export type ClockStyle = 'modern' | 'retro';

export interface Settings {
  theme: Theme;
  customAccentColor?: string;
  clockStyle: ClockStyle;
  is24Hour: boolean;
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  hapticsEnabled: boolean;
  ambientTickEnabled: boolean;
  focusPassword?: string;
  focusMessage: string;
}

export interface Lap {
  id: string;
  time: number;
  lapTime: number;
}
