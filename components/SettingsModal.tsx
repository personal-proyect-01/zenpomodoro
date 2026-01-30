
import React, { useState, useEffect } from 'react';
import { PomodoroSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
}

const TimeInputRow: React.FC<{
  label: string;
  seconds: number;
  onChange: (totalSec: number) => void;
  colorTheme: string;
}> = ({ label, seconds, onChange, colorTheme }) => {
  const [h, setH] = useState(Math.floor(seconds / 3600));
  const [m, setM] = useState(Math.floor((seconds % 3600) / 60));
  const [s, setS] = useState(seconds % 60);

  useEffect(() => {
    setH(Math.floor(seconds / 3600));
    setM(Math.floor((seconds % 3600) / 60));
    setS(seconds % 60);
  }, [seconds]);

  const update = (newH: number, newM: number, newS: number) => {
    const total = (newH * 3600) + (newM * 60) + newS;
    onChange(total);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        <div className="relative group">
          <input type="number" value={h || ''} placeholder="0h" min="0" 
            onChange={e => update(Math.max(0, parseInt(e.target.value) || 0), m, s)}
            className={`w-full bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-${colorTheme}/20 text-center`} />
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase text-slate-300 pointer-events-none">Hora</span>
        </div>
        <div className="relative group">
          <input type="number" value={m || ''} placeholder="0m" min="0" max="59"
            onChange={e => update(h, Math.min(59, Math.max(0, parseInt(e.target.value) || 0)), s)}
            className={`w-full bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-${colorTheme}/20 text-center`} />
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase text-slate-300 pointer-events-none">Min</span>
        </div>
        <div className="relative group">
          <input type="number" value={s || ''} placeholder="0s" min="0" max="59"
            onChange={e => update(h, m, Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
            className={`w-full bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-${colorTheme}/20 text-center`} />
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase text-slate-300 pointer-events-none">Seg</span>
        </div>
      </div>
    </div>
  );
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...localSettings,
      workTime: Math.max(1, localSettings.workTime),
      shortBreakTime: Math.max(1, localSettings.shortBreakTime),
      longBreakTime: Math.max(1, localSettings.longBreakTime),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Estructura</h2>
            <p className="text-xs text-slate-400 font-medium">Configura cada segundo de tu enfoque</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <TimeInputRow label="Tiempo de Pomodoro" seconds={localSettings.workTime} colorTheme="rose-500" 
            onChange={val => setLocalSettings(p => ({...p, workTime: val}))} />
          
          <div className="grid grid-cols-2 gap-4">
             <TimeInputRow label="D. Corto" seconds={localSettings.shortBreakTime} colorTheme="emerald-500" 
              onChange={val => setLocalSettings(p => ({...p, shortBreakTime: val}))} />
             <TimeInputRow label="D. Largo" seconds={localSettings.longBreakTime} colorTheme="sky-500" 
              onChange={val => setLocalSettings(p => ({...p, longBreakTime: val}))} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repeticiones de Pomodoro</label>
              <input type="number" value={localSettings.pomsPerSet} min="1" onChange={e => setLocalSettings(p => ({...p, pomsPerSet: parseInt(e.target.value) || 1}))}
                className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 font-bold text-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descansos Largos</label>
              <input type="number" value={localSettings.setsGoal} min="0" onChange={e => setLocalSettings(p => ({...p, setsGoal: parseInt(e.target.value) || 0}))}
                className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 font-bold text-slate-700" />
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-xs">
            Actualizar Plan Maestro
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
