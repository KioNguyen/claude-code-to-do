import { useState, useEffect } from 'react';
import Head from 'next/head';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';
import { todoApi } from '../services/api';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAllTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos. Make sure the backend is running.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (todoData) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      setTodos([newTodo, ...todos]);
      setError(null);
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, todoData);
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  };

  const filteredTodos = getFilteredTodos();
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Todo App</title>
        <meta name="description" content="A modern todo application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Todo Application
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-8">
          <TodoForm onAdd={handleAddTodo} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md transition ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({todos.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md transition ${
                  filter === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md transition ${
                  filter === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>
            <button
              onClick={fetchTodos}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading todos...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No todos found</p>
            <p className="text-gray-400 text-sm mt-2">
              {filter !== 'all'
                ? `No ${filter} todos`
                : 'Add your first todo above!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
