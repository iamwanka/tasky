
export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
}

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  subtasks: Subtask[];
}