
import React, { useState } from 'react';
import { PomodoroSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    onClose();
  };

  const totalPomos = localSettings.pomsPerSet * (localSettings.setsGoal + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Estructura</h2>
            <p className="text-xs text-slate-400 font-medium">Configura tu flujo de trabajo</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enfoque (min)</label>
                <input type="number" name="workTime" value={localSettings.workTime} onChange={handleChange} min="1" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rose-500/20 font-bold text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repeticiones</label>
                <input type="number" name="pomsPerSet" value={localSettings.pomsPerSet} onChange={handleChange} min="1" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rose-500/20 font-bold text-slate-700" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">D. Corto</label>
                <input type="number" name="shortBreakTime" value={localSettings.shortBreakTime} onChange={handleChange} min="1" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">D. Largo</label>
                <input type="number" name="longBreakTime" value={localSettings.longBreakTime} onChange={handleChange} min="1" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-sky-500/20 font-bold text-slate-700" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cantidad Descansos Largos</label>
              <input type="number" name="setsGoal" value={localSettings.setsGoal} onChange={handleChange} min="0" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-sky-500/20 font-bold text-slate-700" />
              <p className="text-[10px] text-slate-400 mt-2 italic">Esto creará {localSettings.setsGoal + 1} bloques de trabajo para un total de {totalPomos} tomates.</p>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            Actualizar Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
