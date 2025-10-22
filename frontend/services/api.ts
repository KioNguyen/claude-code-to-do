import axios from 'axios';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoApi = {
  // Get all todos
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await api.get<Todo[]>('/todos');
    return response.data;
  },

  // Get a single todo by ID
  getTodoById: async (id: number): Promise<Todo> => {
    const response = await api.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  // Create a new todo
  createTodo: async (todoData: CreateTodoInput): Promise<Todo> => {
    const response = await api.post<Todo>('/todos', todoData);
    return response.data;
  },

  // Update a todo
  updateTodo: async (id: number, todoData: UpdateTodoInput): Promise<Todo> => {
    const response = await api.put<Todo>(`/todos/${id}`, todoData);
    return response.data;
  },

  // Delete a todo
  deleteTodo: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/todos/${id}`);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get<{ status: string }>('/health');
    return response.data;
  },
};

export default api;
