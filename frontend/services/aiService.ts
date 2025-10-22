import api from './api';

export const aiService = {
  /**
   * Generate a description suggestion based on the todo title
   */
  generateDescription: async (title: string): Promise<string> => {
    try {
      const response = await api.post(`/ai/generate-description`, {
        title,
      });

      return response.data.description;
    } catch (error: any) {
      console.error('Error generating description:', error);

      if (error.response?.status === 401) {
        throw new Error('Please log in to use AI features');
      }

      if (error.response?.status === 503) {
        throw new Error('AI service is not configured. Please contact the administrator.');
      }

      const errorMessage = error.response?.data?.error || 'Failed to generate description. Please try again.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Improve the todo title by making it more actionable
   */
  improveTodoTitle: async (title: string): Promise<string> => {
    try {
      const response = await api.post(`/ai/improve-title`, {
        title,
      });

      return response.data.title;
    } catch (error: any) {
      console.error('Error improving title:', error);

      if (error.response?.status === 401) {
        throw new Error('Please log in to use AI features');
      }

      if (error.response?.status === 503) {
        throw new Error('AI service is not configured. Please contact the administrator.');
      }

      const errorMessage = error.response?.data?.error || 'Failed to improve title. Please try again.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Generate both improved title and description
   */
  generateSuggestions: async (title: string, description?: string): Promise<{ title: string; description: string }> => {
    try {
      const response = await api.post(`/ai/suggestions`, {
        title,
        description,
      });

      return {
        title: response.data.title,
        description: response.data.description,
      };
    } catch (error: any) {
      console.error('Error generating suggestions:', error);

      if (error.response?.status === 401) {
        throw new Error('Please log in to use AI features');
      }

      if (error.response?.status === 503) {
        throw new Error('AI service is not configured. Please contact the administrator.');
      }

      const errorMessage = error.response?.data?.error || 'Failed to generate suggestions. Please try again.';
      throw new Error(errorMessage);
    }
  },
};

export default aiService;
