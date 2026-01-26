
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SessionType, TimerStatus, PomodoroSettings, PomodoroState, TaskHistoryItem } from './types';
import { DEFAULT_SETTINGS, SESSION_COLORS } from './constants';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import SettingsModal from './components/SettingsModal';
import SessionIndicator from './components/SessionIndicator';
import TaskModal from './components/TaskModal';
import HistorySidebar from './components/HistorySidebar';
import ManualModal from './components/ManualModal';

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

  const [state, setState] = useState<PomodoroState>(() => {
    const savedHistory = localStorage.getItem('zen-pomo-history-v2');
    return {
      currentSession: SessionType.WORK,
      status: TimerStatus.IDLE,
      timeLeft: settings.workTime * 60,
      completedPomodoros: 0,
      currentIndex: 0,
      currentTaskName: '',
      history: savedHistory ? JSON.parse(savedHistory) : [],
    };
  });

  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Ref para evitar doble reproducción del audio de victoria
  const hasAnnouncedVictoryRef = useRef<boolean>(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('zen-pomo-history-v2', JSON.stringify(state.history));
  }, [state.history]);

  useEffect(() => {
    localStorage.setItem('zen-pomo-settings-v2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    if (state.status === TimerStatus.RUNNING) {
      document.title = `[${timeStr}] ZenPomo`;
    } else if (state.status === TimerStatus.PAUSED) {
      document.title = `(Pausado) ZenPomo`;
    } else {
      document.title = `ZenPomodoro Pro`;
    }
  }, [state.timeLeft, state.status]);

  const togglePiP = async () => {
    try {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        if (!video.srcObject) {
          const stream = (canvas as any).captureStream(30);
          video.srcObject = stream;
        }
        try {
          await video.play();
        } catch (playError: any) {
          if (playError.name !== 'AbortError') throw playError;
        }
        await video.requestPictureInPicture();
      }
    } catch (error: any) {
      console.error("Error al iniciar PiP:", error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const mins = Math.floor(state.timeLeft / 60);
      const secs = state.timeLeft % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const sessionColor = SESSION_COLORS[state.currentSession].hex;
      const totalSeconds = state.currentSession === SessionType.WORK 
        ? settings.workTime * 60 
        : state.currentSession === SessionType.SHORT_BREAK 
          ? settings.shortBreakTime * 60 
          : settings.longBreakTime * 60;
      const progress = (state.timeLeft / totalSeconds);
      ctx.beginPath();
      ctx.arc(100, 100, 80, 0, Math.PI * 2);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(100, 100, 80, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
      ctx.strokeStyle = sessionColor;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 36px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(timeStr, 100, 100);
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(state.currentSession.replace('_', ' '), 100, 135);
    };

    const animFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame);
  }, [state.timeLeft, state.currentSession, settings]);

  const playVictoryAnnouncement = () => {
    // Si ya se anunció la victoria para este ciclo, salimos
    if (hasAnnouncedVictoryRef.current) return;
    hasAnnouncedVictoryRef.current = true;

    // 1. Reproducir sonido de fanfarria
    const fanfarria = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    fanfarria.volume = 0.5;
    fanfarria.play().catch(e => console.log('Audio blocked', e));

    // 2. Usar Síntesis de Voz
    if ('speechSynthesis' in window) {
      // Cancelar cualquier mensaje anterior para evitar colas extrañas
      window.speechSynthesis.cancel();

      const message = new SpeechSynthesisUtterance();
      message.text = `¡Victoria total! Has culminado con éxito tu objetivo: ${state.currentTaskName || 'tu sesión'}. ¡Eres increíble!`;
      message.lang = 'es-ES';
      message.rate = 1.0;
      message.pitch = 1.1;
      
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('es'));
      if (premiumVoice) message.voice = premiumVoice;

      setTimeout(() => {
        window.speechSynthesis.speak(message);
      }, 800);
    }
  };

  const playNotification = useCallback((type: 'success' | 'alert' | 'victory' = 'alert') => {
    if (type === 'victory') {
      playVictoryAnnouncement();
      return;
    }

    let url = '';
    switch(type) {
      case 'success':
        url = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';
        break;
      case 'alert':
      default:
        url = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
        break;
    }
    const audio = new Audio(url);
    audio.play().catch(e => console.log('Audio blocked', e));
  }, [state.currentTaskName]);

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
      if (nextSession === SessionType.WORK) nextTime = settings.workTime * 60;
      else if (nextSession === SessionType.SHORT_BREAK) nextTime = settings.shortBreakTime * 60;
      else nextTime = settings.longBreakTime * 60;

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
      if (prev.currentSession === SessionType.WORK) {
        finalCompleted += 1;
      }

      const newTask: TaskHistoryItem = {
        id: Date.now().toString(),
        name: prev.currentTaskName || 'Tarea sin nombre',
        date: new Date().toLocaleDateString(),
        totalPomos: finalCompleted,
        settings: { ...settings }
      };

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
          const nextTime = prev.timeLeft - 1;
          return { ...prev, timeLeft: nextTime };
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

  const startTimer = () => {
    if (!state.currentTaskName) {
      setIsTaskModalOpen(true);
    } else {
      setState(p => ({...p, status: TimerStatus.RUNNING}));
    }
  };

  const handleTaskConfirm = (name: string) => {
    // Resetear el flag de victoria al confirmar una nueva tarea
    hasAnnouncedVictoryRef.current = false;
    setState(p => ({...p, currentTaskName: name, status: TimerStatus.RUNNING}));
    setIsTaskModalOpen(false);
  };

  const resetTimer = useCallback(() => {
    let nextTime = 0;
    switch (state.currentSession) {
      case SessionType.WORK: nextTime = settings.workTime * 60; break;
      case SessionType.SHORT_BREAK: nextTime = settings.shortBreakTime * 60; break;
      case SessionType.LONG_BREAK: nextTime = settings.longBreakTime * 60; break;
    }
    setState(prev => ({ ...prev, status: TimerStatus.IDLE, timeLeft: nextTime }));
  }, [settings, state.currentSession]);

  const restartDay = (newSettings?: PomodoroSettings) => {
    const s = newSettings || settings;
    const initialRoadmap = generateRoadmap(s);
    // Resetear el flag de victoria al reiniciar el día
    hasAnnouncedVictoryRef.current = false;
    setState(prev => ({
      ...prev,
      currentSession: initialRoadmap[0],
      status: TimerStatus.IDLE,
      timeLeft: s.workTime * 60,
      completedPomodoros: 0,
      currentIndex: 0,
      currentTaskName: '',
    }));
  };

  const currentColor = state.status === TimerStatus.FINISHED 
    ? { bg: 'bg-amber-50', primary: 'amber-500', text: 'text-amber-600', border: 'border-amber-200', label: '¡Objetivo Logrado!', icon: 'fa-trophy' }
    : SESSION_COLORS[state.currentSession];

  const totalTimeInSeconds = state.currentSession === SessionType.WORK 
    ? settings.workTime * 60 
    : state.currentSession === SessionType.SHORT_BREAK 
      ? settings.shortBreakTime * 60 
      : settings.longBreakTime * 60;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-1000 p-4 ${currentColor.bg}`}>
      
      {state.status === TimerStatus.FINISHED && <Confetti />}

      <canvas ref={canvasRef} width="200" height="200" className="opacity-0 pointer-events-none absolute -z-10" />
      <video ref={videoRef} className="opacity-0 pointer-events-none absolute -z-10 w-1 h-1" muted playsInline />

      <header className="fixed top-0 left-0 right-0 p-4 sm:p-8 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-xl shadow-slate-200/50 rotate-3 p-1">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <path d="M16 6c-6.6 0-12 4.4-12 10 0 5.5 5.4 10 12 10s12-4.5 12-10c0-5.6-5.4-10-12-10z" fill="#F43F5E" />
              <path d="M16 8c0-2 1-4 1-4s-2 1-3 3c-1-2-3-3-3-3s1 2 1 4c-2 0-4 1-4 1s2 1 3 1c1 2 2 3 2 3s0-2 1-4c1 2 2 3 2 3s-1-2-1-4c2 0 4-1 4-1s-2-1-3-1z" fill="#22C55E" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">ZenPomo<span className={`text-${currentColor.primary} opacity-50`}>.</span></h1>
        </div>
        
        <div className="flex gap-2 sm:gap-4">
          <button 
            onClick={togglePiP}
            title="Modo flotante"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm transition-all text-slate-600 active:scale-95"
          >
            <i className="fa-solid fa-thumbtack text-base sm:text-lg"></i>
          </button>
          
          <button 
            onClick={() => setIsManualOpen(true)} 
            className="h-10 sm:h-12 px-3 sm:px-5 rounded-full flex items-center justify-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm transition-all text-slate-600 active:scale-95 font-bold text-[10px] sm:text-xs uppercase tracking-widest"
          >
            <i className="fa-solid fa-book-open"></i>
            <span className="hidden sm:inline">Manual</span>
          </button>

          <button 
            onClick={() => setIsHistoryOpen(true)} 
            className="h-10 sm:h-12 px-3 sm:px-5 rounded-full flex items-center justify-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm transition-all text-slate-600 active:scale-95 font-bold text-[10px] sm:text-xs uppercase tracking-widest"
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span className="hidden sm:inline">Historial</span>
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm transition-all text-slate-600 active:scale-95"
          >
            <i className="fa-solid fa-sliders text-lg sm:text-xl"></i>
          </button>
        </div>
      </header>

      <main className="w-full max-w-xl flex flex-col items-center space-y-12 py-24 sm:py-20 relative">
        <SessionIndicator 
          roadmap={roadmap}
          currentIndex={state.currentIndex}
          timeLeft={state.timeLeft}
          totalTime={totalTimeInSeconds}
          colorClass={currentColor.primary}
          currentSession={state.currentSession}
          taskName={state.status !== TimerStatus.FINISHED ? state.currentTaskName : undefined}
        />

        <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-1000">
          <TimerDisplay 
            timeLeft={state.timeLeft} 
            totalTime={totalTimeInSeconds}
            colorClass={currentColor.primary}
            isFinished={state.status === TimerStatus.FINISHED}
            sessionIcon={currentColor.icon}
            sessionLabel={currentColor.label}
          />
        </div>

        {state.status === TimerStatus.FINISHED ? (
          <button onClick={() => restartDay()} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-300">
            <i className="fa-solid fa-rotate-right"></i> Nueva Tarea
          </button>
        ) : (
          <Controls 
            status={state.status}
            onStart={startTimer}
            onPause={() => setState(p => ({...p, status: TimerStatus.PAUSED}))}
            onReset={resetTimer}
            onFinish={handleNextSession}
            onCompleteTask={handleCompleteTask}
            colorClass={currentColor.primary}
          />
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={(s) => { setSettings(s); restartDay(s); }} />
      <TaskModal isOpen={isTaskModalOpen} onConfirm={handleTaskConfirm} onCancel={() => setIsTaskModalOpen(false)} />
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={state.history} onClear={() => setState(p => ({...p, history: []}))} />
      <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} settings={settings} />
    </div>
  );
};

export default App;
