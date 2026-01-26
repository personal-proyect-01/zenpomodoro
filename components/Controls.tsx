
import React from 'react';
import { TimerStatus } from '../types';

interface ControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onFinish: () => void;
  onCompleteTask: () => void;
  colorClass: string;
}

const Controls: React.FC<ControlsProps> = ({ status, onStart, onPause, onReset, onCompleteTask, colorClass }) => {
  const isRunning = status === TimerStatus.RUNNING;
  const isPaused = status === TimerStatus.PAUSED;
  const isIdle = status === TimerStatus.IDLE;

  const getLabel = () => {
    if (isIdle) return 'Enfocar';
    if (isRunning) return 'Pausar';
    if (isPaused) return 'Seguir';
    return '';
  };

  const getIcon = () => {
    if (isRunning) return <i className="fa-solid fa-pause"></i>;
    return <i className="fa-solid fa-play ml-1"></i>;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-center gap-5 sm:gap-8 w-full">
        
        {/* Botón de Reinicio - Izquierda */}
        <button 
          onClick={onReset}
          disabled={isIdle}
          title="Reiniciar bloque"
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-white shadow-sm border border-slate-50 hover:scale-110 active:scale-95 ${isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100 text-slate-300 hover:text-slate-500 hover:border-slate-200'}`}
        >
          <i className="fa-solid fa-rotate-left text-lg"></i>
        </button>

        {/* Botón Principal - Centro */}
        <button 
          onClick={isRunning ? onPause : onStart}
          className={`group relative flex items-center gap-4 px-8 py-5 sm:px-10 sm:py-6 rounded-[2.5rem] text-white shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 bg-${colorClass} shadow-${colorClass}/30 overflow-hidden min-w-[180px] justify-center`}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-xl">
            {getIcon()}
          </div>
          <span className="text-sm sm:text-base font-black uppercase tracking-widest">
            {getLabel()}
          </span>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>

        {/* Botón de Culminar Tarea - Derecha (Reemplaza al de saltar) */}
        <button 
          onClick={onCompleteTask}
          disabled={isIdle}
          title="Finalizar tarea completa"
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-white shadow-sm border border-slate-50 hover:scale-110 active:scale-95 ${isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100 text-slate-300 hover:text-emerald-500 hover:border-emerald-100'}`}
        >
          <div className={`relative ${!isIdle ? 'animate-pulse' : ''}`}>
             <i className="fa-solid fa-check text-xl"></i>
          </div>
        </button>
      </div>

      {/* Indicador sutil de acción para el botón de completar */}
      {!isIdle && (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 animate-in fade-in duration-1000">
          Click en <i className="fa-solid fa-check mx-1"></i> para terminar hoy
        </p>
      )}
    </div>
  );
};

export default Controls;
