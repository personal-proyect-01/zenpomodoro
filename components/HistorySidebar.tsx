
import React, { useState, useMemo } from 'react';
import { TaskHistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: TaskHistoryItem[];
  onClear: () => void;
  onImport: (items: TaskHistoryItem[]) => void;
  onReRunTask: (item: TaskHistoryItem) => void;
}

const formatSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 
    ? `${h}h ${m}m ${s}s`
    : `${m}m ${s}s`;
};

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onClear, onImport, onReRunTask }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    return history
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .reverse();
  }, [history, searchTerm]);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ZenPomo_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) onImport(json);
      } catch (err) {
        alert("Error al procesar el archivo de backup.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[70] animate-in fade-in duration-500" onClick={onClose} />}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-[80] transition-transform duration-700 ease-[cubic-bezier(0.2,1,0.2,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8 sm:p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm">
                <i className="fa-solid fa-apple-whole text-lg"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Historial</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Registro de rendimiento</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"><i className="fa-solid fa-xmark"></i></button>
          </div>

          <div className="relative mb-8">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input type="text" placeholder="Buscar sesión..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-300" />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
            {filteredHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
                <i className="fa-solid fa-wind text-4xl mb-4"></i>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nada por aquí</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div key={item.id} className="group bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 relative flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{item.date}</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-500">
                      <i className="fa-solid fa-apple-whole text-[8px]"></i>
                      <span className="text-[9px] font-black">{item.totalPomos}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end gap-3">
                    <h3 className="font-bold text-slate-700 text-sm leading-tight group-hover:text-slate-900 flex-1">{item.name}</h3>
                    <button onClick={() => onReRunTask(item)} title="Reiniciar esta sesión"
                      className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-200">
                      <i className="fa-solid fa-play ml-0.5"></i>
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[8px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                      {formatSeconds(item.settings.workTime)} focus
                    </span>
                    <span className="text-[8px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                      {item.settings.pomsPerSet} poms
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 space-y-3 pt-6 border-t border-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleExportJSON} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-xl hover:bg-slate-200 transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                <i className="fa-solid fa-download"></i> Backup
              </button>
              <label className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-xl hover:bg-slate-200 transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                <i className="fa-solid fa-upload"></i> Importar
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
            <button onClick={onClear} className="w-full text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-colors py-2 text-center">
              Eliminar base de datos local
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;
