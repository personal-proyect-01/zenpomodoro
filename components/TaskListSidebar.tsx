
import React, { useState } from 'react';
import { PlannedTask, TaskGroup } from '../types';

interface TaskListSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: PlannedTask[];
  groups: TaskGroup[];
  onAddTask: () => void;
  onAddGroup: (group: TaskGroup) => void;
  onDeleteGroup: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: PlannedTask) => void;
  onStartTask: (task: PlannedTask) => void;
  onOpenReport: () => void;
}

const GROUP_COLORS = [
  '#F43F5E', '#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'
];

const formatSecondsCompact = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const TaskListSidebar: React.FC<TaskListSidebarProps> = ({ 
  isOpen, onClose, tasks, groups, onAddTask, onAddGroup, onDeleteGroup, onDeleteTask, onEditTask, onStartTask, onOpenReport
}) => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      onAddGroup({
        id: Date.now().toString(),
        name: newGroupName,
        color: selectedColor
      });
      setNewGroupName('');
      setIsCreatingGroup(false);
    }
  };

  const toggleGroup = (id: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tasksByGroup = (groupId?: string) => tasks.filter(t => t.groupId === groupId);

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
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Organiza por grupos</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:-rotate-90">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="flex gap-2 mb-8">
            <button onClick={onAddTask} className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 uppercase tracking-widest text-[9px]">
              <i className="fa-solid fa-plus"></i> Nueva Tarea
            </button>
            <button onClick={() => setIsCreatingGroup(!isCreatingGroup)} className={`flex-1 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[9px] font-black ${isCreatingGroup ? 'bg-indigo-50 border-indigo-200 text-indigo-500' : 'bg-white border-slate-100 text-slate-400'}`}>
              <i className="fa-solid fa-folder-plus"></i> Grupo
            </button>
            <button onClick={onOpenReport} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center" title="Reporte">
              <i className="fa-solid fa-chart-simple text-lg"></i>
            </button>
          </div>

          {isCreatingGroup && (
            <form onSubmit={handleCreateGroup} className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in slide-in-from-top-4 duration-500 space-y-4">
              <input 
                autoFocus
                type="text" 
                placeholder="Nombre del grupo..." 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)}
                className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/10"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {GROUP_COLORS.map(color => (
                    <button 
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-300' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Crear</button>
              </div>
            </form>
          )}

          <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide pr-2 pb-10">
            {/* Renderizar Grupos */}
            {groups.map(group => {
              const isCollapsed = collapsedGroups.has(group.id);
              const groupTasks = tasksByGroup(group.id);
              return (
                <div key={group.id} className="space-y-4">
                  <div className="flex items-center justify-between group/header">
                    <div 
                      className="flex items-center gap-2 cursor-pointer select-none"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <i className={`fa-solid fa-chevron-right text-[8px] text-slate-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-90'}`}></i>
                      <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: group.color }}></div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">{group.name}</h4>
                      <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md">{groupTasks.length}</span>
                    </div>
                    <button 
                      onClick={() => { if(confirm('¿Eliminar grupo? Las tareas se mantendrán.')) onDeleteGroup(group.id) }}
                      className="opacity-0 group-hover/header:opacity-100 transition-opacity text-slate-300 hover:text-rose-500 text-[10px]"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                      {groupTasks.map(task => (
                        <TaskItem key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} onStart={onStartTask} />
                      ))}
                      {groupTasks.length === 0 && (
                        <p className="text-[9px] text-slate-300 italic pl-6">No hay tareas en este grupo</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Renderizar Sin Grupo */}
            {(() => {
              const ungroupedTasks = tasksByGroup(undefined);
              const isCollapsed = collapsedGroups.has('ungrouped');
              return (
                <div className="space-y-4">
                  <div 
                    className="flex items-center gap-2 cursor-pointer select-none group/ungrouped"
                    onClick={() => toggleGroup('ungrouped')}
                  >
                    <i className={`fa-solid fa-chevron-right text-[8px] text-slate-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-90'}`}></i>
                    <div className="w-1.5 h-4 rounded-full bg-slate-200"></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sin Grupo</h4>
                    <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md">{ungroupedTasks.length}</span>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                      {ungroupedTasks.map(task => (
                        <TaskItem key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} onStart={onStartTask} />
                      ))}
                      {ungroupedTasks.length === 0 && groups.length > 0 && (
                        <p className="text-[9px] text-slate-300 italic pl-6">Todas las tareas están agrupadas</p>
                      )}
                      {tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center opacity-20 py-10">
                          <i className="fa-solid fa-list-check text-4xl mb-4"></i>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lista vacía</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </aside>
    </>
  );
};

const TaskItem: React.FC<{
  task: PlannedTask, 
  onEdit: (t: PlannedTask) => void, 
  onDelete: (id: string) => void, 
  onStart: (t: PlannedTask) => void
}> = ({ task, onEdit, onDelete, onStart }) => (
  <div className="group bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 relative ml-4">
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-bold text-slate-700 text-xs leading-tight group-hover:text-slate-900 pr-16 truncate">{task.name}</h3>
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => onEdit(task)} className="text-slate-200 hover:text-indigo-500 transition-colors"><i className="fa-solid fa-pen-to-square text-[10px]"></i></button>
        <button onClick={() => onDelete(task.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5 mb-3">
      <span className="text-[7px] font-black uppercase tracking-tighter bg-white text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded">
        {formatSecondsCompact(task.settings.workTime)}
      </span>
      <span className="text-[7px] font-black uppercase tracking-tighter bg-white text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded">
        {task.settings.pomsPerSet} Poms
      </span>
    </div>

    <button onClick={() => onStart(task)} className="w-full bg-white border border-slate-100 text-slate-600 font-black py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-[8px] uppercase tracking-widest flex items-center justify-center gap-2">
      <i className="fa-solid fa-play text-[7px]"></i> Iniciar
    </button>
  </div>
);

export default TaskListSidebar;
