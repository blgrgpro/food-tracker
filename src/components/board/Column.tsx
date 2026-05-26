"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column as ColumnType } from "@/types/task";
import type { Task } from "@/types/task";
import { TaskCard } from "@/components/task/TaskCard";
import { AddTaskInput } from "./AddTaskInput";
import { useKanbanStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const COLUMN_ACCENT: Record<string, string> = {
  todo: "text-gray-400",
  doing: "text-indigo-400",
  done: "text-emerald-400",
};

const COLUMN_DOT: Record<string, string> = {
  todo: "bg-gray-500",
  doing: "bg-indigo-500",
  done: "bg-emerald-500",
};

interface Props {
  column: ColumnType;
  tasks: Task[];
}

export function Column({ column, tasks }: Props) {
  const { selectedTaskId, selectTask } = useKanbanStore();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 mb-3 shrink-0">
        <span className={cn("w-2 h-2 rounded-full shrink-0", COLUMN_DOT[column.id])} />
        <span className={cn("text-xs font-semibold tracking-widest uppercase", COLUMN_ACCENT[column.id])}>
          {column.label}
        </span>
        <span className="ml-auto text-[11px] text-gray-700 font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-2 rounded-xl p-2 min-h-[120px] transition-colors duration-150",
          isOver ? "bg-indigo-500/5 ring-1 ring-indigo-500/20" : "bg-[#0f0f1a]/40"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onClick={() => selectTask(selectedTaskId === task.id ? null : task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] text-gray-700">Drop tasks here</p>
          </div>
        )}
      </div>

      <div className="mt-2 shrink-0">
        <AddTaskInput status={column.id} />
      </div>
    </div>
  );
}
