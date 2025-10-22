import { useState } from 'react';
import { Todo, UpdateTodoInput } from '../types/todo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Trash2, Save, X } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, todoData: UpdateTodoInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');

  const handleToggleComplete = async () => {
    await onUpdate(todo.id, { completed: !todo.completed });
  };

  const handleSave = async () => {
    await onUpdate(todo.id, {
      title: editedTitle,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Todo title"
          />
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-semibold ${
                todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p
                className={`mt-1 text-sm ${
                  todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                }`}
              >
                {todo.description}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Created: {new Date(todo.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => onDelete(todo.id)}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
