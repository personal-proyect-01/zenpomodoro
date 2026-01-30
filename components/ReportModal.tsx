
import React, { useState, useMemo } from 'react';
import { TaskHistoryItem, PlannedTask } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TaskHistoryItem[];
  plannedTasks: PlannedTask[];
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, history, plannedTasks }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Extraer nombres únicos combinando el historial Y las tareas planificadas
  const uniqueTaskNames = useMemo(() => {
    const historyNames = history.map(item => item.name);
    const plannedNames = plannedTasks.map(task => task.name);
    
    // Set elimina duplicados automáticamente
    const combinedNames = new Set([...historyNames, ...plannedNames]);
    return Array.from(combinedNames).filter(name => name.trim() !== '').sort();
  }, [history, plannedTasks]);

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const calendarData = useMemo(() => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const totalDays = daysInMonth(month, year);
    const startDay = (firstDayOfMonth(month, year) + 6) % 7; // Ajuste para que empiece en Lunes

    const days = [];
    // Espacios vacíos antes del primer día
    for (let i = 0; i < startDay; i++) days.push(null);
    
    // Días del mes
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = new Date(year, month, d).toLocaleDateString();
      
      const hasActivity = history.some(item => {
        const dateMatch = item.date === dateStr;
        const taskMatch = selectedTaskFilter === 'all' || item.name === selectedTaskFilter;
        return dateMatch && taskMatch;
      });

      days.push({ day: d, hasActivity });
    }
    
    return days;
  }, [viewDate, history, selectedTaskFilter]);

  if (!isOpen) return null;

  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

  const activeDaysCount = calendarData.filter(d => d && d.hasActivity).length;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header del Calendario */}
        <div className="p-8 border-b border-slate-50 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reporte de Enfoque</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Análisis por Objetivo</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Selector de Tarea */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Tarea</label>
            <div className="relative">
              <select 
                value={selectedTaskFilter}
                onChange={(e) => setSelectedTaskFilter(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-600 appearance-none focus:ring-2 focus:ring-rose-500/10 cursor-pointer"
              >
                <option value="all">Todas las tareas (General)</option>
                {uniqueTaskNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] pointer-events-none"></i>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm transition-all text-slate-400">
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <span className="font-black text-slate-700 uppercase tracking-widest text-xs">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm transition-all text-slate-400">
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>

        {/* Grid del Calendario */}
        <div className="p-8 pt-4">
          <div className="grid grid-cols-7 mb-4">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-3">
            {calendarData.map((data, idx) => (
              <div key={idx} className="aspect-square flex items-center justify-center relative">
                {!data ? null : (
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-500
                    ${data.hasActivity 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-110' 
                      : 'text-slate-400 hover:bg-slate-50'}
                  `}>
                    {data.day}
                    {data.hasActivity && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Días con Éxito</span>
              <span className="text-2xl font-black text-slate-800">{activeDaysCount}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Consistencia</span>
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${activeDaysCount > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {activeDaysCount > 10 ? '¡Imparable!' : 'En construcción'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex justify-center">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight text-center">
             {selectedTaskFilter === 'all' 
              ? 'Mostrando actividad combinada de todos tus objetivos.' 
              : `Mostrando solo los días que trabajaste en: "${selectedTaskFilter}"`}
           </p>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
