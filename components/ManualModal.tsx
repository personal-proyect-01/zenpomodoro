
import React from 'react';
import { PomodoroSettings } from '../types';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
}

const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  const totalSets = settings.setsGoal + 1;
  const totalPomodoros = settings.pomsPerSet * totalSets;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Arquitectura ZenPomo</h2>
            <p className="text-xs text-slate-400 font-medium">Entiende tu estructura de alto rendimiento</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          
          {/* SECCIÓN CRÍTICA: LÓGICA DE BLOQUES */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-800">Estructura de Bloques (Sets)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-2">¿Qué es un Bloque?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Un bloque es un conjunto de <strong>{settings.pomsPerSet} pomodoros</strong> seguidos de descansos cortos. Es la unidad mínima de trabajo profundo recomendada.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-2">La Regla de N+1</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Configurar <strong>{settings.setsGoal} descansos largos</strong> genera automáticamente <strong>{totalSets} bloques</strong> de trabajo completos.
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] relative overflow-hidden">
               <div className="relative z-10">
                  <h4 className="font-bold text-emerald-800 text-sm mb-3">Tu Planificación Actual:</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-xs text-emerald-700/80">
                       <i className="fa-solid fa-circle-check"></i>
                       <span>Realizarás <strong>{totalSets} bloques</strong> de {settings.pomsPerSet} pomodoros cada uno.</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-emerald-700/80">
                       <i className="fa-solid fa-circle-check"></i>
                       <span>Tendrás <strong>{settings.setsGoal} descansos largos</strong> de {settings.longBreakTime} min para recuperación total.</span>
                    </div>
                  </div>
               </div>
               <i className="fa-solid fa-diagram-project absolute -right-4 -bottom-4 text-8xl text-emerald-100/50 rotate-12"></i>
            </div>
          </section>

          {/* IMPORTANCIA DEL DESCANSO LARGO */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Importancia del Descanso Largo</h3>
            <div className="p-6 rounded-[2rem] bg-sky-50 border border-sky-100 flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-sky-500 flex-shrink-0 shadow-sm">
                <i className="fa-solid fa-battery-full text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-sky-800 text-sm mb-1">Reset Cognitivo</h4>
                <p className="text-[11px] text-sky-700/70 leading-relaxed">
                  A diferencia de los descansos cortos (para hidratación o estiramiento), el <strong>Descanso Largo</strong> está diseñado para que tu cerebro asimile la información y evite la fatiga mental extrema después de un bloque de 2 horas (aprox). Es lo que permite mantener el rendimiento en el segundo y tercer bloque.
                </p>
              </div>
            </div>
          </section>

          {/* Fases Rápidas */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Resumen de Tiempos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-rose-50 border border-rose-100">
                <i className="fa-solid fa-brain text-rose-500 mb-3 text-xl"></i>
                <h4 className="font-bold text-rose-700 text-sm mb-1">Enfoque</h4>
                <p className="text-[11px] text-rose-600/70 leading-relaxed">{settings.workTime} min de concentración total.</p>
              </div>
              <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100">
                <i className="fa-solid fa-mug-hot text-emerald-500 mb-3 text-xl"></i>
                <h4 className="font-bold text-emerald-700 text-sm mb-1">D. Corto</h4>
                <p className="text-[11px] text-emerald-600/70 leading-relaxed">{settings.shortBreakTime} min entre pomodoros.</p>
              </div>
              <div className="p-5 rounded-3xl bg-sky-50 border border-sky-100">
                <i className="fa-solid fa-umbrella-beach text-sky-500 mb-3 text-xl"></i>
                <h4 className="font-bold text-sky-700 text-sm mb-1">D. Largo</h4>
                <p className="text-[11px] text-sky-600/70 leading-relaxed">{settings.longBreakTime} min al finalizar un bloque.</p>
              </div>
            </div>
          </section>

          {/* Datos Técnicos */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Persistencia y Datos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 flex-shrink-0">
                  <i className="fa-solid fa-database"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm mb-1">Almacenamiento</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Todo se guarda localmente en tu navegador de forma permanente.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 flex-shrink-0">
                  <i className="fa-solid fa-thumbtack"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm mb-1">Picture-in-Picture</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Usa el modo flotante para ver el tiempo sobre otras apps.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 flex justify-center border-t border-slate-100">
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            Optimizar mi Enfoque
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualModal;
