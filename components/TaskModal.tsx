
import React, { useState } from 'react';

interface TaskModalProps {
  isOpen: boolean;
  onConfirm: (taskName: string) => void;
  onCancel: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const [taskName, setTaskName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      onConfirm(taskName);
      setTaskName('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-pen-nib"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">¿En qué vas a enfocar?</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Define tu objetivo para este ciclo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            autoFocus
            type="text" 
            placeholder="Ej: Diseñar landing page..." 
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-rose-500/20 font-bold text-slate-700 placeholder:text-slate-300"
          />
          
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={!taskName.trim()}
              className="flex-2 bg-slate-900 text-white font-black py-4 px-8 rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-30 shadow-lg shadow-slate-200"
            >
              Empezar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
