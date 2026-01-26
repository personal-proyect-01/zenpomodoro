
export enum SessionType {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export interface PomodoroSettings {
  workTime: number; 
  shortBreakTime: number; 
  longBreakTime: number; 
  pomsPerSet: number;    
  setsGoal: number;      
}

export interface TaskHistoryItem {
  id: string;
  name: string;
  date: string;
  totalPomos: number;
  settings: PomodoroSettings; // Nueva propiedad para auditoría y análisis
}

export interface PomodoroState {
  currentSession: SessionType;
  status: TimerStatus;
  timeLeft: number; 
  completedPomodoros: number;
  currentIndex: number;
  currentTaskName: string;
  history: TaskHistoryItem[];
}
