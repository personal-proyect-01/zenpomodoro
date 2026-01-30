
import React from 'react';
import { PlannedTask } from '../types';

interface TaskListSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: PlannedTask[];
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: PlannedTask) => void;
  onStartTask: (task: PlannedTask) => void;
  onOpenReport: () => void;
}

const formatSecondsCompact = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const TaskListSidebar: React.FC<TaskListSidebarProps> = ({ 
  isOpen, onClose, tasks, onAddTask, onDeleteTask, onEditTask, onStartTask, onOpenReport
}) => {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[70] animate-in fade-in duration-500" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white shadow-[20px_0_50px_rgba(0,0,0,0.05)] z-[80] transition-transform duration-700 ease-[cubic-bezier(0.2,1,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8 sm:p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                <i className="fa-solid fa-apple-whole text-lg"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Planificación</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Tu lista de enfoque</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:-rotate-90">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="flex gap-3 mb-8">
            <button onClick={onAddTask} className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 uppercase tracking-widest text-[9px]">
              <i className="fa-solid fa-plus"></i> Nueva Tarea
            </button>
            <button onClick={onOpenReport} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center" title="Reporte de Productividad">
              <i className="fa-solid fa-chart-simple text-lg"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pr-2">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
                <i className="fa-solid fa-list-check text-4xl mb-4"></i>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lista vacía</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="group bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 relative">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-700 text-sm leading-tight group-hover:text-slate-900 pr-16">{task.name}</h3>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => onEditTask(task)} className="text-slate-200 hover:text-indigo-500 transition-colors"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                      <button onClick={() => onDeleteTask(task.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[8px] font-black uppercase tracking-tighter bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md">
                      {formatSecondsCompact(task.settings.workTime)} Focus
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-md">
                      {task.settings.pomsPerSet} Poms
                    </span>
                    {task.settings.setsGoal > 0 && (
                      <span className="text-[8px] font-black uppercase tracking-tighter bg-sky-50 text-sky-500 px-2 py-0.5 rounded-md">
                        {task.settings.setsGoal} Breaks
                      </span>
                    )}
                  </div>

                  <button onClick={() => onStartTask(task)} className="w-full bg-white border border-slate-100 text-slate-600 font-black py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <i className="fa-solid fa-play text-[8px]"></i> Iniciar Sesión
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default TaskListSidebar;
