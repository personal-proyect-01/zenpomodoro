
import React, { useState, useEffect } from 'react';
import { PomodoroSettings, PlannedTask } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onConfirm: (taskName: string, settings?: PomodoroSettings) => void;
  onCancel: () => void;
  isPlannedMode?: boolean;
  initialData?: PlannedTask | null;
}

const TimeInputGroup: React.FC<{
  label: string;
  totalSeconds: number;
  onChange: (unit: 'h' | 'm' | 's', val: number) => void;
  accentColor: string;
}> = ({ label, totalSeconds, onChange, accentColor }) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <input 
            type="number" value={h || ''} placeholder="0" min="0"
            onChange={e => onChange('h', Math.max(0, parseInt(e.target.value) || 0))}
            className={`w-full bg-slate-50 border-none rounded-xl px-1 py-3 text-xs font-bold text-slate-700 text-center focus:ring-2 focus:ring-${accentColor}/10 transition-all`} 
          />
          <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[6px] font-black uppercase text-slate-300">H</span>
        </div>
        <div className="relative flex-1">
          <input 
            type="number" value={m || ''} placeholder="0" min="0" max="59"
            onChange={e => onChange('m', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
            className={`w-full bg-slate-50 border-none rounded-xl px-1 py-3 text-xs font-bold text-slate-700 text-center focus:ring-2 focus:ring-${accentColor}/10 transition-all`} 
          />
          <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[6px] font-black uppercase text-slate-300">M</span>
        </div>
        <div className="relative flex-1">
          <input 
            type="number" value={s || ''} placeholder="0" min="0" max="59"
            onChange={e => onChange('s', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
            className={`w-full bg-slate-50 border-none rounded-xl px-1 py-3 text-xs font-bold text-slate-700 text-center focus:ring-2 focus:ring-${accentColor}/10 transition-all`} 
          />
          <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[6px] font-black uppercase text-slate-300">S</span>
        </div>
      </div>
    </div>
  );
};

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onConfirm, onCancel, isPlannedMode, initialData }) => {
  const [taskName, setTaskName] = useState('');
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTaskName(initialData.name);
        setLocalSettings(initialData.settings);
      } else {
        setTaskName('');
        setLocalSettings(DEFAULT_SETTINGS);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleTimeUpdate = (key: 'workTime' | 'shortBreakTime' | 'longBreakTime', unit: 'h' | 'm' | 's', val: number) => {
    const current = localSettings[key];
    let h = Math.floor(current / 3600);
    let m = Math.floor((current % 3600) / 60);
    let s = current % 60;

    if (unit === 'h') h = val;
    if (unit === 'm') m = val;
    if (unit === 's') s = val;

    setLocalSettings(prev => ({ ...prev, [key]: (h * 3600) + (m * 60) + s }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      // Validar que al menos el tiempo de enfoque sea > 0
      const finalSettings = isPlannedMode ? {
        ...localSettings,
        workTime: Math.max(1, localSettings.workTime)
      } : undefined;
      onConfirm(taskName, finalSettings);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white rounded-[2.5rem] w-full ${isPlannedMode ? 'max-w-md' : 'max-w-sm'} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8`}>
        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl shadow-sm ${isPlannedMode ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'}`}>
            <i className={`fa-solid ${isPlannedMode ? (initialData ? 'fa-pen-to-square' : 'fa-list-check') : 'fa-pen-nib'}`}></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {isPlannedMode ? (initialData ? 'Editar Plan' : 'Planificar Tarea') : '¿Qué vamos a lograr?'}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configuración personalizada</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Objetivo</label>
            <input 
              autoFocus 
              type="text" 
              placeholder="Ej: Terminar informe técnico..." 
              value={taskName} 
              onChange={e => setTaskName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 placeholder:text-slate-200 focus:ring-2 focus:ring-slate-100 transition-all" 
            />
          </div>

          {isPlannedMode && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <TimeInputGroup 
                label="Tiempo de Pomodoro" 
                totalSeconds={localSettings.workTime} 
                accentColor="rose-500"
                onChange={(unit, val) => handleTimeUpdate('workTime', unit, val)} 
              />

              <div className="grid grid-cols-2 gap-4">
                <TimeInputGroup 
                  label="Descanso Corto" 
                  totalSeconds={localSettings.shortBreakTime} 
                  accentColor="emerald-500"
                  onChange={(unit, val) => handleTimeUpdate('shortBreakTime', unit, val)} 
                />
                <TimeInputGroup 
                  label="Descanso Largo" 
                  totalSeconds={localSettings.longBreakTime} 
                  accentColor="sky-500"
                  onChange={(unit, val) => handleTimeUpdate('longBreakTime', unit, val)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Repeticiones de Pomodoro</label>
                  <div className="relative">
                    <input 
                      type="number" value={localSettings.pomsPerSet} min="1" 
                      onChange={e => setLocalSettings(p => ({...p, pomsPerSet: parseInt(e.target.value) || 1}))}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/10" 
                    />
                    <i className="fa-solid fa-apple-whole absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 text-xs"></i>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciclos de Descanso</label>
                  <div className="relative">
                    <input 
                      type="number" value={localSettings.setsGoal} min="0" 
                      onChange={e => setLocalSettings(p => ({...p, setsGoal: parseInt(e.target.value) || 0}))}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/10" 
                    />
                    <i className="fa-solid fa-mug-hot absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onCancel} 
              className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
            >
              Cerrar
            </button>
            <button 
              type="submit" 
              disabled={!taskName.trim()} 
              className="flex-[1.5] bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-30 text-xs shadow-xl shadow-slate-200 uppercase tracking-widest"
            >
              {isPlannedMode ? (initialData ? 'Actualizar Plan' : 'Guardar Plan') : 'Empezar ahora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
