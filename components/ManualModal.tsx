
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
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Documentación ZenPomo Pro</h2>
            <p className="text-xs text-slate-400 font-medium">Guía avanzada para el alto rendimiento</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide">
          
          {/* NUEVA SECCIÓN: PLANIFICACIÓN */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-lg shadow-indigo-100">
                <i className="fa-solid fa-list-check"></i>
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-800">Planificación y Backlog</h3>
            </div>
            
            <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-[2rem] space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                ZenPomo permite separar la <strong>configuración global</strong> de tus <strong>objetivos específicos</strong>. 
                Gestiona tus tareas futuras y dales parámetros únicos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
                  <h4 className="font-bold text-slate-800 text-[11px] mb-1 uppercase tracking-wider">Edición y Control</h4>
                  <p className="text-[10px] text-slate-500">Puedes editar cualquier tarea planificada para ajustar sus tiempos de enfoque o ciclos antes de iniciarla.</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
                  <h4 className="font-bold text-slate-800 text-[11px] mb-1 uppercase tracking-wider">Reportes por Objetivo</h4>
                  <p className="text-[10px] text-slate-500">Usa el icono de gráfico en el panel de Planificación para ver qué días trabajaste en qué tarea. Selecciona un objetivo específico para ver tu racha de consistencia.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ESTRUCTURA DE BLOQUES */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-800">Lógica de Ciclos Avanzada</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Bloques (Sets)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Un bloque es un conjunto de <strong>{settings.pomsPerSet} repeticiones de pomodoro</strong>. El sistema está diseñado para ráfagas de alta concentración.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Descansos Largos</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Configurar <strong>{settings.setsGoal} descansos largos</strong> genera <strong>{totalSets} bloques</strong>. Un reset cognitivo tras el esfuerzo acumulado.
                </p>
              </div>
            </div>
          </section>

          {/* HISTORIAL Y REPETICIÓN */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs shadow-lg shadow-rose-100">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-800">Memoria y Persistencia</h3>
            </div>
            
            <div className="bg-rose-50/30 border border-rose-100 p-6 rounded-[2rem] flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Registro de Sesiones</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Al terminar una sesión, la tarea se archiva. ZenPomo recuerda los ajustes de cada sesión para que puedas repetirla con un solo click.
                </p>
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Privacidad Local</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tus datos nunca salen de tu dispositivo. Usamos almacenamiento persistente local para garantizar tu privacidad total.
                </p>
              </div>
            </div>
          </section>

          {/* DATOS Y PRIVACIDAD */}
          <section className="pt-4 border-t border-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <i className="fa-solid fa-shield-halved text-slate-300 text-xl mb-3"></i>
                <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-widest mb-1">Privacidad</h4>
                <p className="text-[10px] text-slate-400">Datos guardados en IndexedDB local.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <i className="fa-solid fa-cloud-arrow-down text-slate-300 text-xl mb-3"></i>
                <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-widest mb-1">Backups</h4>
                <p className="text-[10px] text-slate-400">Exporta tu historial en JSON en cualquier momento.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <i className="fa-solid fa-mobile-screen text-slate-300 text-xl mb-3"></i>
                <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-widest mb-1">Responsivo</h4>
                <p className="text-[10px] text-slate-400">Diseñado para Focus en móvil y escritorio.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 flex justify-center border-t border-slate-100">
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-200"
          >
            Entendido, ¡A trabajar!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualModal;
