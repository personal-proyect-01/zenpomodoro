
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  colorClass: string;
  isFinished?: boolean;
  sessionIcon?: string;
  sessionLabel?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  timeLeft, 
  totalTime, 
  colorClass, 
  isFinished, 
  sessionIcon = 'fa-brain',
  sessionLabel
}) => {
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  
  const percentage = isFinished ? 100 : (timeLeft / totalTime) * 100;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] group select-none">
      <div className={`absolute inset-16 rounded-full blur-[60px] opacity-10 transition-all duration-1000 bg-${colorClass} group-hover:scale-110`}></div>
      <div className="absolute inset-0 rounded-full bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.01),0_20px_50px_rgba(0,0,0,0.04)] border-[10px] sm:border-[14px] border-white"></div>

      <svg className="absolute inset-0 w-full h-full -rotate-90 p-1 sm:p-2" viewBox="0 0 320 320">
        <circle cx="160" cy="160" r={radius} fill="transparent" stroke="#F8FAFC" strokeWidth="10" strokeLinecap="round" />
        <circle
          cx="160" cy="160" r={radius} fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray={circumference}
          strokeDashoffset={offset} strokeLinecap="round" className={`transition-all duration-1000 ease-linear text-${colorClass}`}
        />
      </svg>

      <div className="relative flex flex-col items-center justify-center w-full z-10 px-4 text-center">
        {isFinished ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-1000">
            <div className={`w-20 h-20 sm:w-28 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-2xl shadow-amber-200/50 mb-4 sm:mb-6 animate-bounce`}>
              <i className="fa-solid fa-trophy text-4xl sm:text-6xl drop-shadow-lg"></i>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm sm:text-base font-black uppercase tracking-[0.3em] text-amber-600">¡Victoria!</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Día de Éxito</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className={`mb-1 sm:mb-2 transition-all duration-500 text-${colorClass} opacity-30`}>
              <i className={`fa-solid ${sessionIcon} text-lg sm:text-2xl`}></i>
            </div>
            
            <span className={`${h > 0 ? 'text-4xl sm:text-5xl md:text-6xl' : 'text-5xl sm:text-7xl md:text-8xl'} font-medium tracking-tight text-slate-900 mono tabular-nums leading-tight overflow-hidden whitespace-nowrap`}>
              {h > 0 && <span>{String(h).padStart(2, '0')}:</span>}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </span>

            {sessionLabel && (
              <div className={`mt-2 sm:mt-4 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700 bg-slate-50 border border-slate-100 text-slate-400`}>
                {sessionLabel}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;
