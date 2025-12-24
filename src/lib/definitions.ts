export type User = {
  id: string;
  name: string;
  email: string;
};

export type Project = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  name: string;
  projectId: string;
};

export type Subtask = {
  id: string;
  name: string;
  description: string;
  taskId: string;
  assignedToUserId: string | null;
};

export type Screenshot = {
    id: string;
    imageUrl: string;
    time: string;
    keyboardStrokes: number;
    mouseMovements: number;
    imageHint: string;
};
