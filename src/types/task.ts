export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  notes: string[];
}

export interface Column {
  id: TaskStatus;
  label: string;
}

export const COLUMNS: Column[] = [
  { id: "todo", label: "TO DO" },
  { id: "doing", label: "DOING" },
  { id: "done", label: "DONE" },
];
