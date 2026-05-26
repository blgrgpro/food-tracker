"use client";

import { useKanbanStore } from "@/lib/store";
import { useState } from "react";
import { Search, Kanban, X } from "lucide-react";

export function TopBar() {
  const { setSearchQuery, searchQuery, addTask } = useKanbanStore();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a3e] shrink-0 bg-[#0d0d1a]">
      <div className="flex items-center gap-2 mr-auto">
        <Kanban size={18} className="text-indigo-400" />
        <span className="text-sm font-semibold text-gray-100 tracking-tight">Kanban</span>
      </div>

      {showSearch ? (
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { setSearchQuery(""); setShowSearch(false); } }}
            placeholder="Search tasks…"
            className="flex-1 bg-[#1a1a2e] border border-[#3a3a5e] rounded-md text-sm text-gray-200 placeholder-gray-600 px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => { setSearchQuery(""); setShowSearch(false); }}
            className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="p-1.5 rounded hover:bg-white/5 text-gray-600 hover:text-gray-300 transition-colors"
          title="Search (Ctrl+K)"
        >
          <Search size={15} />
        </button>
      )}

      <button
        onClick={() => addTask("New task", "todo")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
      >
        + Add Task
      </button>
    </header>
  );
}
