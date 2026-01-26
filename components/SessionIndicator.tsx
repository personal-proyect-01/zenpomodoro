
import React from 'react';
import { SessionType } from '../types';

interface SessionIndicatorProps {
  roadmap: SessionType[];
  currentIndex: number;
  timeLeft: number;
  totalTime: number;
  colorClass: string;
  currentSession: SessionType;
  taskName?: string;
}

// Fix: Use React.FC to ensure internal React props like 'key' are recognized by TypeScript
const TomatoIcon: React.FC<{ active?: boolean, progress: number, past?: boolean }> = ({ active, progress, past }) => {
  const fillLevel = past ? 100 : (active ? progress : 0);
  const id = React.useId();

  return (
    <div className="relative group flex items-center justify-center">
      <svg viewBox="0 0 32 32" className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-700 ${active ? 'scale-125 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'scale-100'}`}>
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect x="0" y={32 - (32 * fillLevel / 100)} width="32" height="32" className="transition-all duration-1000 ease-linear" />
          </clipPath>
        </defs>
        
        {/* Cuerpo base (Vacío) */}
        <path 
          d="M16 6c-6.6 0-12 4.4-12 10 0 5.5 5.4 10 12 10s12-4.5 12-10c0-5.6-5.4-10-12-10z" 
          fill="#E2E8F0" 
        />
        
        {/* Cuerpo pintado (Con máscara de progreso) */}
        <path 
          d="M16 6c-6.6 0-12 4.4-12 10 0 5.5 5.4 10 12 10s12-4.5 12-10c0-5.6-5.4-10-12-10z" 
          fill="#F43F5E" 
          clipPath={`url(#clip-${id})`}
        />

        {/* Hojas */}
        <path d="M16 8c0-2 1-4 1-4s-2 1-3 3c-1-2-3-3-3-3s1 2 1 4c-2 0-4 1-4 1s2 1 3 1c1 2 2 3 2 3s0-2 1-4c1 2 2 3 2 3s-1-2-1-4c2 0 4-1 4-1s-2-1-3-1z" fill={fillLevel > 0 ? "#22C55E" : "#CBD5E1"} />
      </svg>
      {active && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>}
    </div>
  );
};

// Fix: Use React.FC to ensure internal React props like 'key' are recognized by TypeScript
const BreakIcon: React.FC<{ active?: boolean, type: SessionType, past?: boolean, progress: number }> = ({ active, type, past, progress }) => {
  const isShort = type === SessionType.SHORT_BREAK;
  const iconClass = isShort ? "fa-mug-hot" : "fa-umbrella-beach";
  const colorClass = isShort ? "text-emerald-500" : "text-sky-500";
  const fillLevel = past ? 100 : (active ? progress : 0);

  return (
    <div className={`transition-all duration-700 flex flex-col items-center justify-center ${active ? 'scale-125' : 'scale-100'}`}>
      <div className="relative text-lg sm:text-xl">
        {/* Icono base (Gris) */}
        <i className={`fa-solid ${iconClass} text-slate-200`}></i>
        
        {/* Icono pintado con recorte de altura */}
        <div 
          className="absolute inset-0 overflow-hidden transition-all duration-1000 ease-linear"
          style={{ height: `${fillLevel}%`, bottom: 0, top: 'auto' }}
        >
          <i className={`fa-solid ${iconClass} ${colorClass} absolute bottom-0`}></i>
        </div>
      </div>
      {active && <div className={`w-1.5 h-1.5 rounded-full mt-2 animate-pulse ${isShort ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]'}`}></div>}
    </div>
  );
};

const SessionIndicator: React.FC<SessionIndicatorProps> = ({ roadmap, currentIndex, timeLeft, totalTime, currentSession, taskName }) => {
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  // Filtrar solo los iconos del tipo de sesión actual para mostrar en la barra
  const filteredSessions = roadmap.filter(type => type === currentSession);
  
  // Calcular en qué posición del subconjunto estamos
  let relativeActiveIndex = 0;
  let count = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (roadmap[i] === currentSession) {
      relativeActiveIndex = count;
      count++;
    }
  }

  const containerStyles = {
    [SessionType.WORK]: "border-rose-100 shadow-rose-900/5",
    [SessionType.SHORT_BREAK]: "border-emerald-100 shadow-emerald-900/5",
    [SessionType.LONG_BREAK]: "border-sky-100 shadow-sky-900/5",
  };

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-top-6 duration-1000">
      <div className={`bg-white rounded-[2rem] border-2 shadow-xl ${containerStyles[currentSession]} flex flex-col items-center overflow-hidden transition-all duration-700 w-fit min-w-[120px]`}>
        
        {/* Nombre de la tarea (Objetivo) dentro del contenedor */}
        {taskName && currentSession === SessionType.WORK && (
          <div className="w-full bg-slate-50/50 border-b border-slate-100 py-2 px-6 flex items-center justify-center gap-2">
            <i className="fa-solid fa-bullseye text-rose-400 text-[8px]"></i>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[150px]">
              {taskName}
            </span>
          </div>
        )}

        {/* Contenedor de iconos */}
        <div className="flex items-center justify-center gap-5 sm:gap-7 px-8 py-5">
          {filteredSessions.map((type, idx) => {
            const isCurrent = idx === relativeActiveIndex;
            const isPast = idx < relativeActiveIndex;
            
            if (type === SessionType.WORK) {
              return (
                <TomatoIcon 
                  key={idx} 
                  active={isCurrent} 
                  past={isPast}
                  progress={progressPercent} 
                />
              );
            } else {
              return (
                <BreakIcon 
                  key={idx} 
                  active={isCurrent} 
                  past={isPast}
                  type={type} 
                  progress={progressPercent}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default SessionIndicator;
