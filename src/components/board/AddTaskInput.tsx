"use client";

import { useState, useRef } from "react";
import { useKanbanStore } from "@/lib/store";
import type { TaskStatus } from "@/types/task";
import { Plus, X } from "lucide-react";

interface Props {
  status: TaskStatus;
}

export function AddTaskInput({ status }: Props) {
  const { addTask } = useKanbanStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function open_() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit() {
    const trimmed = value.trim();
    if (trimmed) addTask(trimmed, status);
    setValue("");
    setOpen(false);
  }

  function cancel() {
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={open_}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[12px] text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors"
      >
        <Plus size={13} />
        Add task
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") cancel();
        }}
        placeholder="Task title…"
        className="w-full bg-[#1a1a2e] border border-indigo-500 rounded-md text-sm text-gray-100 placeholder-gray-600 px-2.5 py-1.5 outline-none"
      />
      <div className="flex gap-1.5">
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="px-3 py-1 rounded text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
        <button
          onClick={cancel}
          className="p-1 rounded text-gray-600 hover:text-gray-400 transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
