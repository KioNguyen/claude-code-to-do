import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoApi = {
  // Get all todos
  getAllTodos: async () => {
    const response = await api.get('/todos');
    return response.data;
  },

  // Get a single todo by ID
  getTodoById: async (id) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  // Create a new todo
  createTodo: async (todoData) => {
    const response = await api.post('/todos', todoData);
    return response.data;
  },

  // Update a todo
  updateTodo: async (id, todoData) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  // Delete a todo
  deleteTodo: async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
