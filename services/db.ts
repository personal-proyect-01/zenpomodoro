
import { TaskHistoryItem, PlannedTask } from '../types';

const DB_NAME = 'ZenPomoDB';
const STORE_HISTORY = 'history';
const STORE_TASKS = 'planned_tasks';
const DB_VERSION = 2; // Incrementar versión para nueva store

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Error al abrir la base de datos');

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        const store = db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_TASKS)) {
        db.createObjectStore(STORE_TASKS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };
  });
};

// --- Operaciones de Historial ---
export const saveHistoryItem = async (item: TaskHistoryItem): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_HISTORY], 'readwrite');
    const store = transaction.objectStore(STORE_HISTORY);
    store.add(item);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject('Error al guardar historial');
  });
};

export const getAllHistory = async (): Promise<TaskHistoryItem[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_HISTORY], 'readonly');
    const store = transaction.objectStore(STORE_HISTORY);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

export const clearAllHistory = async (): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_HISTORY], 'readwrite');
  transaction.objectStore(STORE_HISTORY).clear();
};

export const importHistory = async (items: TaskHistoryItem[]): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_HISTORY], 'readwrite');
  const store = transaction.objectStore(STORE_HISTORY);
  items.forEach(item => store.put(item));
};

// --- Operaciones de Tareas Planificadas ---
export const savePlannedTask = async (task: PlannedTask): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_TASKS], 'readwrite');
  transaction.objectStore(STORE_TASKS).put(task);
};

export const deletePlannedTask = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_TASKS], 'readwrite');
  transaction.objectStore(STORE_TASKS).delete(id);
};

export const getPlannedTasks = async (): Promise<PlannedTask[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction([STORE_TASKS], 'readonly');
    const request = transaction.objectStore(STORE_TASKS).getAll();
    request.onsuccess = () => resolve(request.result);
  });
};
