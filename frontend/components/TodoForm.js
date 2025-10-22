import { useState } from 'react';

export default function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAdd({
      title: title.trim(),
      description: description.trim(),
      completed: false,
    });

    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Todo</h2>
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
      >
        Add Todo
      </button>
    </form>
  );
}
