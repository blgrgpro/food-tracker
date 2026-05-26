"use client";

import { useState, useRef, useEffect } from "react";
import { useKanbanStore } from "@/lib/store";
import type { TaskStatus } from "@/types/task";
import { COLUMNS } from "@/types/task";
import { cn } from "@/lib/utils";
import {
  X,
  Trash2,
  Plus,
  Check,
  Pencil,
  ChevronRight,
} from "lucide-react";

export function TaskDetail() {
  const { tasks, selectedTaskId, selectTask, updateTask, deleteTask, moveTask, addNote, updateNote, deleteNote } =
    useKanbanStore();

  const task = tasks.find((t) => t.id === selectedTaskId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [newNote, setNewNote] = useState("");
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [editingNoteDraft, setEditingNoteDraft] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (task) {
      setEditingTitle(false);
      setEditingDesc(false);
      setEditingNoteIdx(null);
      setNewNote("");
    }
  }, [task?.id]);

  if (!task) return null;

  function commitTitle() {
    if (!task) return;
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) updateTask(task.id, { title: trimmed });
    setEditingTitle(false);
  }

  function commitDesc() {
    if (!task) return;
    const trimmed = descDraft.trim();
    updateTask(task.id, { description: trimmed || undefined });
    setEditingDesc(false);
  }

  function submitNote() {
    const trimmed = newNote.trim();
    if (!trimmed || !task) return;
    addNote(task.id, trimmed);
    setNewNote("");
  }

  function commitNoteEdit() {
    if (editingNoteIdx === null || !task) return;
    const trimmed = editingNoteDraft.trim();
    if (trimmed) updateNote(task.id, editingNoteIdx, trimmed);
    else deleteNote(task.id, editingNoteIdx);
    setEditingNoteIdx(null);
  }

  return (
    <aside className="flex flex-col h-full bg-[#13131f] border-l border-[#2a2a3e] w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3e] shrink-0">
        <span className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">
          Task
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              deleteTask(task.id);
            }}
            className="p-1.5 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => selectTask(null)}
            className="p-1.5 rounded hover:bg-white/5 text-gray-600 hover:text-gray-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Title */}
        <div>
          {editingTitle ? (
            <input
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") setEditingTitle(false);
              }}
              className="w-full bg-transparent text-base font-semibold text-gray-100 outline-none border-b border-indigo-500 pb-0.5"
            />
          ) : (
            <button
              onClick={() => {
                setTitleDraft(task.title);
                setEditingTitle(true);
              }}
              className="group/title w-full text-left text-base font-semibold text-gray-100 hover:text-white flex items-start gap-2"
            >
              <span className="flex-1 leading-snug">{task.title}</span>
              <Pencil size={12} className="mt-0.5 opacity-0 group-hover/title:opacity-40 shrink-0 transition-opacity" />
            </button>
          )}
        </div>

        {/* Status selector */}
        <div className="flex gap-1.5">
          {COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => moveTask(task.id, col.id as TaskStatus)}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-medium tracking-wide transition-all",
                task.status === col.id
                  ? "bg-indigo-600 text-white"
                  : "bg-[#1a1a2e] text-gray-500 hover:text-gray-300 hover:bg-[#2a2a3e]"
              )}
            >
              {col.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <div>
          <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
            Description
          </p>
          {editingDesc ? (
            <textarea
              autoFocus
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              onBlur={commitDesc}
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditingDesc(false);
              }}
              rows={3}
              placeholder="Add a description…"
              className="w-full bg-[#1a1a2e] border border-[#3a3a5e] rounded-md text-sm text-gray-200 placeholder-gray-600 px-3 py-2 resize-none outline-none focus:border-indigo-500 transition-colors"
            />
          ) : (
            <button
              onClick={() => {
                setDescDraft(task.description ?? "");
                setEditingDesc(true);
              }}
              className="w-full text-left text-sm text-gray-500 hover:text-gray-300 min-h-[2rem] transition-colors"
            >
              {task.description || <span className="italic text-gray-700">No description — click to add</span>}
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-2">
            Notes
          </p>

          <div className="space-y-2">
            {task.notes.map((note, idx) => (
              <div key={idx} className="group/note flex gap-2">
                <ChevronRight size={12} className="mt-1 text-gray-700 shrink-0" />
                {editingNoteIdx === idx ? (
                  <div className="flex-1 flex gap-1.5">
                    <textarea
                      autoFocus
                      value={editingNoteDraft}
                      onChange={(e) => setEditingNoteDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitNoteEdit(); }
                        if (e.key === "Escape") setEditingNoteIdx(null);
                      }}
                      rows={2}
                      className="flex-1 bg-[#1a1a2e] border border-[#3a3a5e] rounded text-xs text-gray-200 px-2 py-1 resize-none outline-none focus:border-indigo-500"
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={commitNoteEdit} className="p-1 rounded hover:bg-indigo-500/20 text-indigo-400">
                        <Check size={11} />
                      </button>
                      <button
                        onClick={() => { deleteNote(task.id, idx); setEditingNoteIdx(null); }}
                        className="p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => { setEditingNoteIdx(idx); setEditingNoteDraft(note); }}
                    className="flex-1 text-xs text-gray-400 hover:text-gray-200 cursor-pointer leading-relaxed whitespace-pre-wrap"
                  >
                    {note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Add note */}
          <div className="flex gap-2 mt-3">
            <textarea
              ref={noteRef}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitNote(); }
              }}
              rows={2}
              placeholder="Add a note… (Enter to save)"
              className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-md text-xs text-gray-200 placeholder-gray-600 px-2.5 py-2 resize-none outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={submitNote}
              disabled={!newNote.trim()}
              className="self-end p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
