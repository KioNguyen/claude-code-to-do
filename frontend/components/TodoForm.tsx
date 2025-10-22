import { useState, FormEvent } from 'react';
import { CreateTodoInput } from '../types/todo';
import { aiService } from '../services/aiService';

interface TodoFormProps {
  onAdd: (todoData: CreateTodoInput) => Promise<void>;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAdd({
      title: title.trim(),
      description: description.trim(),
      completed: false,
    });

    setTitle('');
    setDescription('');
    setAiError(null);
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      setAiError('Please enter a title first');
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const generatedDescription = await aiService.generateDescription(title);
      setDescription(generatedDescription);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetAISuggestions = async () => {
    if (!title.trim()) {
      setAiError('Please enter a title first');
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const suggestions = await aiService.generateSuggestions(title, description);
      setTitle(suggestions.title);
      setDescription(suggestions.description);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Todo</h2>

      {aiError && (
        <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md text-sm">
          {aiError}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGenerating || !title.trim()}
            className="text-xs px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isGenerating ? (
              <>
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                Generating...
              </>
            ) : (
              <>✨ AI Generate</>
            )}
          </button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGetAISuggestions}
          disabled={isGenerating || !title.trim()}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : '✨ Improve with AI'}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
        >
          Add Todo
        </button>
      </div>
    </form>
  );
}
