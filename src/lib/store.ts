import { create } from "zustand";
import type { Task, TaskStatus } from "@/types/task";
import { loadTasks, saveTasks } from "@/lib/storage";
import { generateId } from "@/lib/utils";

interface KanbanStore {
  tasks: Task[];
  selectedTaskId: string | null;
  searchQuery: string;

  hydrate: () => void;
  selectTask: (id: string | null) => void;
  setSearchQuery: (q: string) => void;

  addTask: (title: string, status: TaskStatus) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  reorderTasks: (activeId: string, overId: string, status: TaskStatus) => void;

  addNote: (taskId: string, note: string) => void;
  updateNote: (taskId: string, index: number, note: string) => void;
  deleteNote: (taskId: string, index: number) => void;
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  searchQuery: "",

  hydrate() {
    set({ tasks: loadTasks() });
  },

  selectTask(id) {
    set({ selectedTaskId: id });
  },

  setSearchQuery(q) {
    set({ searchQuery: q });
  },

  addTask(title, status) {
    const now = Date.now();
    const task: Task = {
      id: generateId(),
      title: title.trim(),
      status,
      createdAt: now,
      updatedAt: now,
      notes: [],
    };
    const tasks = [...get().tasks, task];
    saveTasks(tasks);
    set({ tasks });
  },

  updateTask(id, patch) {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t
    );
    saveTasks(tasks);
    set({ tasks });
  },

  deleteTask(id) {
    const tasks = get().tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    set({ tasks, selectedTaskId: get().selectedTaskId === id ? null : get().selectedTaskId });
  },

  moveTask(id, status) {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, status, updatedAt: Date.now() } : t
    );
    saveTasks(tasks);
    set({ tasks });
  },

  reorderTasks(activeId, overId, status) {
    const tasks = [...get().tasks];
    const colTasks = tasks.filter((t) => t.status === status);
    const activeIdx = colTasks.findIndex((t) => t.id === activeId);
    const overIdx = colTasks.findIndex((t) => t.id === overId);
    if (activeIdx === -1 || overIdx === -1) return;

    const [moved] = colTasks.splice(activeIdx, 1);
    colTasks.splice(overIdx, 0, moved);

    const otherTasks = tasks.filter((t) => t.status !== status);
    const reordered = [...otherTasks, ...colTasks];
    saveTasks(reordered);
    set({ tasks: reordered });
  },

  addNote(taskId, note) {
    const tasks = get().tasks.map((t) =>
      t.id === taskId
        ? { ...t, notes: [...t.notes, note], updatedAt: Date.now() }
        : t
    );
    saveTasks(tasks);
    set({ tasks });
  },

  updateNote(taskId, index, note) {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const notes = [...t.notes];
      notes[index] = note;
      return { ...t, notes, updatedAt: Date.now() };
    });
    saveTasks(tasks);
    set({ tasks });
  },

  deleteNote(taskId, index) {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const notes = t.notes.filter((_, i) => i !== index);
      return { ...t, notes, updatedAt: Date.now() };
    });
    saveTasks(tasks);
    set({ tasks });
  },
}));
