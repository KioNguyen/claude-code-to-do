import { useState, useEffect } from 'react';
import Head from 'next/head';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { todoApi } from '../services/api';
import { Todo, CreateTodoInput, UpdateTodoInput, FilterType } from '../types/todo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RefreshCw, Loader2, AlertCircle, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    } else {
      setLoading(false);
      setTodos([]);
    }
  }, [isAuthenticated]);

  const fetchTodos = async () => {
    try {
      setRefreshing(true);
      const data = await todoApi.getAllTodos();
      setTodos(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch todos. Make sure the backend is running.';
      setError(errorMessage);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddTodo = async (todoData: CreateTodoInput) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      setTodos([newTodo, ...todos]);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create todo';
      setError(errorMessage);
      console.error('Error creating todo:', err);
    }
  };

  const handleUpdateTodo = async (id: number, todoData: UpdateTodoInput) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, todoData);
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update todo';
      setError(errorMessage);
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete todo';
      setError(errorMessage);
      console.error('Error deleting todo:', err);
    }
  };

  const getFilteredTodos = (): Todo[] => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    fetchTodos();
  };

  const handleLogout = () => {
    logout();
    setTodos([]);
  };

  const filteredTodos = getFilteredTodos();
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Head>
        <title>Todo App - Shadcn UI</title>
        <meta name="description" content="A modern todo application with Shadcn UI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Todo Application
              </h1>
              <p className="text-muted-foreground mt-2">Manage your tasks efficiently</p>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user?.username}</span>
                  </div>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} variant="default" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isAuthenticated && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to manage your todos and use AI features
            </AlertDescription>
          </Alert>
        )}

        {isAuthenticated && (
          <div className="mb-6">
            <TodoForm onAdd={handleAddTodo} />
          </div>
        )}

        {isAuthenticated && (
          <>
            <Separator className="my-6" />

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
                    <TabsList>
                      <TabsTrigger value="all">
                        All ({todos.length})
                      </TabsTrigger>
                      <TabsTrigger value="active">
                        Active ({activeCount})
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        Completed ({completedCount})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    onClick={fetchTodos}
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isAuthenticated && (
          loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading todos...</p>
              </CardContent>
            </Card>
          ) : filteredTodos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-muted-foreground">No todos found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {filter !== 'all'
                    ? `No ${filter} todos`
                    : 'Add your first todo above!'}
                </p>
              </CardContent>
            </Card>
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
          )
        )}

        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="sm:max-w-md">
            {authMode === 'login' ? (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
