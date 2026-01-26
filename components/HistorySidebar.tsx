
import React from 'react';
import { TaskHistoryItem } from '../types';
import * as XLSX from 'xlsx';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: TaskHistoryItem[];
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onClear }) => {
  
  const handleExportExcel = () => {
    if (history.length === 0) return;

    const dataToExport = history.map(item => ({
      'ID': item.id,
      'Tarea': item.name,
      'Fecha': item.date,
      'Pomodoros Completados': item.totalPomos,
      'Config: Enfoque (min)': item.settings.workTime,
      'Config: Descanso Corto (min)': item.settings.shortBreakTime,
      'Config: Descanso Largo (min)': item.settings.longBreakTime,
      'Config: Pomos por Ciclo': item.settings.pomsPerSet,
      'Config: Meta de Ciclos': item.settings.setsGoal
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      {wch: 15}, {wch: 30}, {wch: 15}, {wch: 22}, {wch: 20}, {wch: 25}, {wch: 25}, {wch: 20}, {wch: 20}
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Análisis de Productividad");

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `ZenPomo_Reporte_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[70] animate-in fade-in duration-500"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-[80] transition-transform duration-700 ease-[cubic-bezier(0.2,1,0.2,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8 sm:p-12">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Historial</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mt-1">Análisis de rendimiento</p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                <i className="fa-solid fa-box-open text-6xl mb-6"></i>
                <p className="font-bold text-slate-400">Sin registros permanentes</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="group relative bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{item.date}</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-500">
                      <i className="fa-solid fa-apple-whole text-[10px]"></i>
                      <span className="text-[10px] font-black">{item.totalPomos}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-700 text-lg leading-tight group-hover:text-slate-900 transition-colors">{item.name}</h3>
                  <div className="mt-4 flex gap-2 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[8px] px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold uppercase">{item.settings.workTime}m focus</span>
                    <span className="text-[8px] px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold uppercase">{item.settings.pomsPerSet} ciclos</span>
                  </div>
                </div>
              )).reverse()
            )}
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-50 pt-8">
            <div className="flex items-center justify-center gap-2 mb-2 text-[9px] font-black uppercase tracking-widest text-emerald-500/60">
               <i className="fa-solid fa-database animate-pulse"></i>
               Sincronizado localmente
            </div>
            
            {history.length > 0 && (
              <>
                <button 
                  onClick={handleExportExcel}
                  className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                >
                  <i className="fa-solid fa-file-excel text-lg"></i>
                  Descargar Excel (.xlsx)
                </button>

                <button 
                  onClick={onClear}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center gap-2 py-2"
                >
                  <i className="fa-solid fa-trash-can"></i>
                  Borrar Base de Datos
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;
