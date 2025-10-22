export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateTodoInput {
  title: string;
  description: string;
  completed: boolean;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

export type FilterType = 'all' | 'active' | 'completed';
