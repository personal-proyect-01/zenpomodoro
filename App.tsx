
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SessionType, TimerStatus, PomodoroSettings, PomodoroState, TaskHistoryItem, PlannedTask, TaskGroup } from './types';
import { DEFAULT_SETTINGS, SESSION_COLORS } from './constants';
import { 
  getAllHistory, saveHistoryItem, clearAllHistory, importHistory, 
  getPlannedTasks, savePlannedTask, deletePlannedTask,
  getTaskGroups, saveTaskGroup, deleteTaskGroup
} from './services/db';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import SettingsModal from './components/SettingsModal';
import SessionIndicator from './components/SessionIndicator';
import TaskModal from './components/TaskModal';
import HistorySidebar from './components/HistorySidebar';
import TaskListSidebar from './components/TaskListSidebar';
import ManualModal from './components/ManualModal';
import ReportModal from './components/ReportModal';

const Confetti: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {[...Array(50)].map((_, i) => {
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 3 + 2;
        const colors = ['#F43F5E', '#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <div
            key={i}
            className="absolute top-[-20px] rounded-sm animate-confetti"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: 0.8
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation-name: confetti;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('zen-pomo-settings-v2');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const generateRoadmap = (s: PomodoroSettings): SessionType[] => {
    const sequence: SessionType[] = [];
    for (let set = 0; set <= s.setsGoal; set++) {
      for (let p = 1; p <= s.pomsPerSet; p++) {
        sequence.push(SessionType.WORK);
        if (p < s.pomsPerSet) {
          sequence.push(SessionType.SHORT_BREAK);
        } else if (set < s.setsGoal) {
          sequence.push(SessionType.LONG_BREAK);
        }
      }
    }
    return sequence;
  };

  const roadmap = useMemo(() => generateRoadmap(settings), [settings]);

  const [state, setState] = useState<PomodoroState>(() => ({
    currentSession: SessionType.WORK,
    status: TimerStatus.IDLE,
    timeLeft: settings.workTime,
    completedPomodoros: 0,
    currentIndex: 0,
    currentTaskName: '',
    history: [],
    plannedTasks: [],
    groups: []
  }));

  const timerRef = useRef<number | null>(null);
  const hasAnnouncedVictoryRef = useRef<boolean>(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPlannedMode, setIsPlannedMode] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannedTask | null>(null);

  useEffect(() => {
    Promise.all([getAllHistory(), getPlannedTasks(), getTaskGroups()]).then(([history, plannedTasks, groups]) => {
      setState(prev => ({ ...prev, history, plannedTasks, groups }));
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('zen-pomo-settings-v2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const h = Math.floor(state.timeLeft / 3600);
    const m = Math.floor((state.timeLeft % 3600) / 60);
    const s = state.timeLeft % 60;
    
    const timeStr = h > 0 
      ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    
    if (state.status === TimerStatus.RUNNING) {
      document.title = `[${timeStr}] ZenPomo`;
    } else if (state.status === TimerStatus.PAUSED) {
      document.title = `(Pausado) ZenPomo`;
    } else {
      document.title = `ZenPomodoro Pro`;
    }
  }, [state.timeLeft, state.status]);

  const playVictoryAnnouncement = () => {
    if (hasAnnouncedVictoryRef.current) return;
    hasAnnouncedVictoryRef.current = true;
    const fanfarria = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    fanfarria.volume = 0.5;
    fanfarria.play().catch(e => console.log('Audio blocked', e));

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const message = new SpeechSynthesisUtterance();
      message.text = `¡Victoria total! Has culminado con éxito tu objetivo: ${state.currentTaskName || 'tu sesión'}. ¡Eres increíble!`;
      message.lang = 'es-ES';
      message.rate = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('es'));
      if (premiumVoice) message.voice = premiumVoice;
      setTimeout(() => window.speechSynthesis.speak(message), 800);
    }
  };

  const playNotification = useCallback((type: 'success' | 'alert' | 'victory' = 'alert') => {
    if (type === 'victory') {
      playVictoryAnnouncement();
      return;
    }
    const urls = {
      success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      alert: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
    };
    const audio = new Audio(urls[type === 'success' ? 'success' : 'alert']);
    audio.play().catch(e => console.log('Audio blocked', e));
  }, []);

  const handleNextSession = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      let nextCompleted = prev.completedPomodoros;
      if (prev.currentSession === SessionType.WORK) {
        nextCompleted += 1;
      }

      if (nextIndex >= roadmap.length) {
        playNotification('victory');
        const newTask: TaskHistoryItem = {
          id: Date.now().toString(),
          name: prev.currentTaskName || 'Tarea sin nombre',
          date: new Date().toLocaleDateString(),
          totalPomos: nextCompleted,
          settings: { ...settings }
        };

        saveHistoryItem(newTask);

        return {
          ...prev,
          status: TimerStatus.FINISHED,
          timeLeft: 0,
          completedPomodoros: nextCompleted,
          history: [...prev.history, newTask]
        };
      }

      const nextSession = roadmap[nextIndex];
      let nextTime = 0;
      if (nextSession === SessionType.WORK) nextTime = settings.workTime;
      else if (nextSession === SessionType.SHORT_BREAK) nextTime = settings.shortBreakTime;
      else nextTime = settings.longBreakTime;

      playNotification('alert');

      return {
        ...prev,
        currentSession: nextSession,
        status: TimerStatus.RUNNING,
        timeLeft: nextTime,
        completedPomodoros: nextCompleted,
        currentIndex: nextIndex
      };
    });
  }, [roadmap, settings, playNotification]);

  const handleCompleteTask = useCallback(() => {
    playNotification('victory');
    setState(prev => {
      let finalCompleted = prev.completedPomodoros;
      if (prev.currentSession === SessionType.WORK) finalCompleted += 1;

      const newTask: TaskHistoryItem = {
        id: Date.now().toString(),
        name: prev.currentTaskName || 'Tarea sin nombre',
        date: new Date().toLocaleDateString(),
        totalPomos: finalCompleted,
        settings: { ...settings }
      };

      saveHistoryItem(newTask);

      return {
        ...prev,
        status: TimerStatus.FINISHED,
        timeLeft: 0,
        completedPomodoros: finalCompleted,
        history: [...prev.history, newTask]
      };
    });
  }, [playNotification, settings]);

  useEffect(() => {
    if (state.status === TimerStatus.RUNNING) {
      timerRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 0) return prev; 
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.status]);

  useEffect(() => {
    if (state.timeLeft <= 0 && state.status === TimerStatus.RUNNING) {
      handleNextSession();
    }
  }, [state.timeLeft, state.status, handleNextSession]);

  const handleTaskConfirm = (name: string, customSettings?: PomodoroSettings, groupId?: string) => {
    if (isPlannedMode && customSettings) {
      const newTask: PlannedTask = {
        id: editingTask ? editingTask.id : Date.now().toString(),
        name,
        settings: customSettings,
        createdAt: editingTask ? editingTask.createdAt : Date.now(),
        groupId: groupId
      };
      savePlannedTask(newTask);
      setState(p => ({ 
        ...p, 
        plannedTasks: editingTask 
          ? p.plannedTasks.map(t => t.id === newTask.id ? newTask : t)
          : [...p.plannedTasks, newTask] 
      }));
    } else {
      hasAnnouncedVictoryRef.current = false;
      setState(p => ({...p, currentTaskName: name, status: TimerStatus.RUNNING, timeLeft: settings.workTime}));
    }
    setIsTaskModalOpen(false);
    setIsPlannedMode(false);
    setEditingTask(null);
  };

  const handleStartPlannedTask = (task: PlannedTask) => {
    setSettings(task.settings);
    hasAnnouncedVictoryRef.current = false;
    setState(prev => ({
      ...prev,
      currentTaskName: task.name,
      status: TimerStatus.RUNNING,
      timeLeft: task.settings.workTime,
      currentIndex: 0,
      completedPomodoros: 0,
      currentSession: SessionType.WORK
    }));
    setIsTaskListOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    await deletePlannedTask(id);
    setState(p => ({ ...p, plannedTasks: p.plannedTasks.filter(t => t.id !== id) }));
  };

  const handleEditPlannedTask = (task: PlannedTask) => {
    setEditingTask(task);
    setIsPlannedMode(true);
    setIsTaskModalOpen(true);
  };

  const handleAddGroup = async (group: TaskGroup) => {
    await saveTaskGroup(group);
    setState(p => ({ ...p, groups: [...p.groups, group] }));
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteTaskGroup(id);
    // Mover tareas del grupo eliminado a "Sin Grupo"
    const updatedTasks = state.plannedTasks.map(t => t.groupId === id ? { ...t, groupId: undefined } : t);
    // En un escenario real, deberíamos guardar cada tarea actualizada en la DB
    // Por simplicidad en este MVP, actualizamos el estado
    setState(p => ({ 
      ...p, 
      groups: p.groups.filter(g => g.id !== id),
      plannedTasks: updatedTasks
    }));
  };

  const restartDay = (newSettings?: PomodoroSettings) => {
    const s = newSettings || settings;
    hasAnnouncedVictoryRef.current = false;
    setState(prev => ({
      ...prev,
      currentSession: SessionType.WORK,
      status: TimerStatus.IDLE,
      timeLeft: s.workTime,
      completedPomodoros: 0,
      currentIndex: 0,
      currentTaskName: '',
    }));
  };

  const handleReRunTask = (item: TaskHistoryItem) => {
    setSettings(item.settings);
    hasAnnouncedVictoryRef.current = false;
    setState(prev => ({
      ...prev,
      currentTaskName: item.name,
      status: TimerStatus.RUNNING,
      timeLeft: item.settings.workTime,
      currentIndex: 0,
      completedPomodoros: 0,
      currentSession: SessionType.WORK
    }));
    setIsHistoryOpen(false);
  };

  const currentColor = state.status === TimerStatus.FINISHED 
    ? { bg: 'bg-amber-50', primary: 'amber-500', icon: 'fa-trophy', label: '¡Victoria!' }
    : SESSION_COLORS[state.currentSession];

  const totalTimeInSeconds = state.currentSession === SessionType.WORK 
    ? settings.workTime 
    : state.currentSession === SessionType.SHORT_BREAK 
      ? settings.shortBreakTime 
      : settings.longBreakTime;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-1000 p-4 ${currentColor.bg}`}>
      {state.status === TimerStatus.FINISHED && <Confetti />}

      <header className="fixed top-0 left-0 right-0 p-4 sm:p-8 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-xl rotate-3 p-1">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <path d="M16 6c-6.6 0-12 4.4-12 10 0 5.5 5.4 10 12 10s12-4.5 12-10c0-5.6-5.4-10-12-10z" fill="#F43F5E" />
              <path d="M16 8c0-2 1-4 1-4s-2 1-3 3c-1-2-3-3-3-3s1 2 1 4c-2 0-4 1-4 1s2 1 3 1c1 2 2 3 2 3s0-2 1-4c1 2 2 3 2 3s-1-2-1-4c2 0 4-1 4-1s-2-1-3-1z" fill="#22C55E" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">ZenPomo.</h1>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          <button onClick={() => setIsManualOpen(true)} className="h-10 sm:h-12 px-3 sm:px-5 rounded-full flex items-center justify-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm transition-all text-slate-600 font-bold text-[10px] sm:text-xs tracking-widest uppercase" title="Manual de Uso">
            <i className="fa-solid fa-book-open"></i>
            <span className="hidden lg:inline">Manual</span>
          </button>
          
          <button onClick={() => setIsTaskListOpen(true)} className="h-10 sm:h-12 px-3 sm:px-5 rounded-full flex items-center justify-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm transition-all text-slate-600 font-bold text-[10px] sm:text-xs tracking-widest uppercase" title="Tareas Planificadas">
            <i className="fa-solid fa-list-check"></i>
            <span className="hidden lg:inline">Plan</span>
          </button>

          <button onClick={() => setIsHistoryOpen(true)} className="h-10 sm:h-12 px-3 sm:px-5 rounded-full flex items-center justify-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm transition-all text-slate-600 font-bold text-[10px] sm:text-xs tracking-widest uppercase" title="Ver Historial">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span className="hidden lg:inline">Historial</span>
          </button>

          <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm transition-all text-slate-600" title="Configuraciones">
            <i className="fa-solid fa-sliders text-lg"></i>
          </button>
        </div>
      </header>

      <main className="w-full max-w-xl flex flex-col items-center space-y-12 py-24 sm:py-20">
        <SessionIndicator roadmap={roadmap} currentIndex={state.currentIndex} timeLeft={state.timeLeft} totalTime={totalTimeInSeconds} colorClass={currentColor.primary} currentSession={state.currentSession} taskName={state.status !== TimerStatus.FINISHED ? state.currentTaskName : undefined} />
        <TimerDisplay timeLeft={state.timeLeft} totalTime={totalTimeInSeconds} colorClass={currentColor.primary} isFinished={state.status === TimerStatus.FINISHED} sessionIcon={currentColor.icon} sessionLabel={currentColor.label} />
        {state.status === TimerStatus.FINISHED ? (
          <button onClick={() => restartDay()} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-300"><i className="fa-solid fa-rotate-right"></i> Nueva Tarea</button>
        ) : (
          <Controls status={state.status} onStart={() => !state.currentTaskName ? setIsTaskModalOpen(true) : setState(p => ({...p, status: TimerStatus.RUNNING}))} onPause={() => setState(p => ({...p, status: TimerStatus.PAUSED}))} onReset={() => setState(prev => ({ ...prev, status: TimerStatus.IDLE, timeLeft: (state.currentSession === SessionType.WORK ? settings.workTime : state.currentSession === SessionType.SHORT_BREAK ? settings.shortBreakTime : settings.longBreakTime) }))} onFinish={handleNextSession} onCompleteTask={handleCompleteTask} colorClass={currentColor.primary} />
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={(s) => { setSettings(s); restartDay(s); }} />
      <TaskModal 
        isOpen={isTaskModalOpen} 
        isPlannedMode={isPlannedMode} 
        initialData={editingTask}
        groups={state.groups}
        onConfirm={handleTaskConfirm} 
        onCancel={() => { setIsTaskModalOpen(false); setIsPlannedMode(false); setEditingTask(null); }} 
      />
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={state.history} onClear={() => { clearAllHistory(); setState(p => ({...p, history: []})); }} onImport={(items) => { importHistory(items); getAllHistory().then(h => setState(p => ({...p, history: h}))); }} onReRunTask={handleReRunTask} />
      <TaskListSidebar 
        isOpen={isTaskListOpen} 
        onClose={() => setIsTaskListOpen(false)} 
        tasks={state.plannedTasks} 
        groups={state.groups}
        onAddTask={() => { setIsPlannedMode(true); setIsTaskModalOpen(true); setEditingTask(null); }} 
        onAddGroup={handleAddGroup}
        onDeleteGroup={handleDeleteGroup}
        onDeleteTask={handleDeleteTask} 
        onEditTask={handleEditPlannedTask}
        onStartTask={handleStartPlannedTask} 
        onOpenReport={() => setIsReportOpen(true)}
      />
      <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} settings={settings} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} history={state.history} plannedTasks={state.plannedTasks} />
    </div>
  );
};

export default App;
