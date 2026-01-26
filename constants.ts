
import { PomodoroSettings, SessionType } from './types';

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workTime: 25,       
  shortBreakTime: 5, 
  longBreakTime: 15,  
  pomsPerSet: 4,  
  setsGoal: 0,    
};

export const SESSION_COLORS = {
  [SessionType.WORK]: {
    bg: 'bg-[#FFF5F5]',
    primary: 'rose-500',
    hex: '#F43F5E',
    text: 'text-rose-600',
    border: 'border-rose-100',
    label: 'Tiempo de Enfoque',
    icon: 'fa-brain'
  },
  [SessionType.SHORT_BREAK]: {
    bg: 'bg-[#F0FDF4]',
    primary: 'emerald-500',
    hex: '#10B981',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    label: 'Descanso Corto',
    icon: 'fa-mug-hot'
  },
  [SessionType.LONG_BREAK]: {
    bg: 'bg-[#F0F9FF]',
    primary: 'sky-500',
    hex: '#0EA5E9',
    text: 'text-sky-600',
    border: 'border-sky-100',
    label: 'Descanso Largo',
    icon: 'fa-umbrella-beach'
  }
};
