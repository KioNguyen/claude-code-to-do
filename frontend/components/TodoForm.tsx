import { useState, FormEvent } from 'react';
import { CreateTodoInput } from '../types/todo';
import { aiService } from '../services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, Plus } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle>Add New Todo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {aiError && (
            <Alert variant="destructive">
              <AlertDescription>{aiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating || !title.trim()}
                size="sm"
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    AI Generate
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleGetAISuggestions}
              disabled={isGenerating || !title.trim()}
              className="flex-1 gap-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-purple-500/50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Improve with AI
                </>
              )}
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Add Todo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
