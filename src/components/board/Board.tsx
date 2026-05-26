"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useKanbanStore } from "@/lib/store";
import { COLUMNS, type TaskStatus } from "@/types/task";
import type { Task } from "@/types/task";
import { Column } from "./Column";
import { TaskDetail } from "@/components/task/TaskDetail";
import { cn } from "@/lib/utils";

export function Board() {
  const { tasks, selectedTaskId, hydrate, moveTask, reorderTasks } = useKanbanStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    hydrate();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const searchQuery = useKanbanStore((s) => s.searchQuery.toLowerCase());

  const filteredTasks = searchQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery) ||
          t.description?.toLowerCase().includes(searchQuery)
      )
    : tasks;

  function onDragStart(e: DragStartEvent) {
    const task = tasks.find((t) => t.id === e.active.id);
    if (task) setActiveTask(task);
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = String(over.id);
    const overIsColumn = COLUMNS.some((c) => c.id === overId);

    if (overIsColumn && activeTask.status !== overId) {
      moveTask(String(active.id), overId as TaskStatus);
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && overTask.status !== activeTask.status) {
        moveTask(String(active.id), overTask.status);
      }
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;

    const overId = String(over.id);
    const overIsColumn = COLUMNS.some((c) => c.id === overId);
    if (overIsColumn) return;

    const activeId = String(active.id);
    if (activeId !== overId) {
      const activeT = tasks.find((t) => t.id === activeId);
      if (activeT) reorderTasks(activeId, overId, activeT.status);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className={cn("flex flex-1 min-h-0 gap-0 overflow-hidden")}>
        {/* Columns */}
        <div className="flex flex-1 gap-4 px-4 py-4 overflow-x-auto min-h-0">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col min-w-[220px] flex-1 min-h-0">
              <Column
                column={col}
                tasks={filteredTasks.filter((t) => t.status === col.id)}
              />
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selectedTaskId && (
          <div className="w-[320px] shrink-0 flex flex-col min-h-0 border-l border-[#2a2a3e]">
            <TaskDetail />
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rounded-lg border border-indigo-400 bg-[#1e1e35] px-3 py-2.5 shadow-2xl opacity-90 rotate-1 cursor-grabbing">
            <p className="text-sm font-medium text-gray-100">{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
