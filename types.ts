
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
  workTime: number; // Segundos totales
  shortBreakTime: number; // Segundos totales
  longBreakTime: number; // Segundos totales
  pomsPerSet: number;    
  setsGoal: number;      
}

export interface PlannedTask {
  id: string;
  name: string;
  settings: PomodoroSettings;
  createdAt: number;
}

export interface TaskHistoryItem {
  id: string;
  name: string;
  date: string;
  totalPomos: number;
  settings: PomodoroSettings;
}

export interface PomodoroState {
  currentSession: SessionType;
  status: TimerStatus;
  timeLeft: number; 
  completedPomodoros: number;
  currentIndex: number;
  currentTaskName: string;
  history: TaskHistoryItem[];
  plannedTasks: PlannedTask[];
}
