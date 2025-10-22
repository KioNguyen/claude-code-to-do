import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const aiService = {
  /**
   * Generate a description suggestion based on the todo title
   */
  generateDescription: async (title: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/generate-description`, {
        title,
      });

      return response.data.description;
    } catch (error: any) {
      console.error('Error generating description:', error);

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
      const response = await axios.post(`${API_BASE_URL}/ai/improve-title`, {
        title,
      });

      return response.data.title;
    } catch (error: any) {
      console.error('Error improving title:', error);

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
      const response = await axios.post(`${API_BASE_URL}/ai/suggestions`, {
        title,
        description,
      });

      return {
        title: response.data.title,
        description: response.data.description,
      };
    } catch (error: any) {
      console.error('Error generating suggestions:', error);

      if (error.response?.status === 503) {
        throw new Error('AI service is not configured. Please contact the administrator.');
      }

      const errorMessage = error.response?.data?.error || 'Failed to generate suggestions. Please try again.';
      throw new Error(errorMessage);
    }
  },
};

export default aiService;
