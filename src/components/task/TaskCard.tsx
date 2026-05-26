"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/task";
import { cn, formatRelativeTime } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface Props {
  task: Task;
  isSelected: boolean;
  onClick: () => void;
}

export function TaskCard({ task, isSelected, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative rounded-lg border px-3 py-2.5 cursor-pointer select-none",
        "bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#4a4a6e]",
        "transition-all duration-150",
        isSelected && "border-indigo-500 bg-[#1e1e35]",
        isDragging && "opacity-50 scale-95 shadow-2xl border-indigo-400"
      )}
    >
      <p className="text-sm font-medium text-gray-100 leading-snug line-clamp-2">
        {task.title}
      </p>
      <div className="flex items-center gap-2 mt-2">
        {task.notes.length > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <MessageSquare size={11} />
            {task.notes.length}
          </span>
        )}
        <span className="text-[11px] text-gray-600 ml-auto">
          {formatRelativeTime(task.updatedAt)}
        </span>
      </div>
    </div>
  );
}
