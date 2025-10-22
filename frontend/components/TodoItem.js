import { useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');

  const handleToggleComplete = async () => {
    await onUpdate(todo.id, { ...todo, completed: !todo.completed });
  };

  const handleSave = async () => {
    await onUpdate(todo.id, {
      ...todo,
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
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Todo title"
        />
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Description (optional)"
          rows="3"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-start gap-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggleComplete}
        className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex-1">
        <h3
          className={`text-lg font-semibold ${
            todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {todo.title}
        </h3>
        {todo.description && (
          <p
            className={`mt-1 text-sm ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
            }`}
          >
            {todo.description}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          Created: {new Date(todo.created_at).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
