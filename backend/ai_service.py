import os
from openai import OpenAI
from typing import Dict, Optional

class AIService:
    def __init__(self):
        """Initialize AI service with OpenAI client"""
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.api_url = os.getenv('OPENAI_API_URL', 'https://api.openai.com/v1')
        self.model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')

        if not self.api_key:
            raise ValueError('OPENAI_API_KEY environment variable is not set')

        # Initialize OpenAI client
        client_kwargs = {'api_key': self.api_key}

        # Only add base_url if it's different from the default
        if self.api_url and self.api_url != 'https://api.openai.com/v1':
            client_kwargs['base_url'] = self.api_url

        self.client = OpenAI(**client_kwargs)

    def generate_description(self, title: str) -> str:
        """
        Generate a description suggestion based on the todo title

        Args:
            title: The todo title

        Returns:
            Generated description
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a helpful assistant that helps users create detailed todo descriptions. Generate a concise, actionable description for the given todo title. Keep it brief (1-2 sentences) and focused on what needs to be done.'
                    },
                    {
                        'role': 'user',
                        'content': f'Generate a brief description for this todo: "{title}"'
                    }
                ],
                max_tokens=100,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()
        except Exception as e:
            raise Exception(f'Failed to generate description: {str(e)}')

    def improve_todo_title(self, title: str) -> str:
        """
        Improve the todo title by making it more actionable

        Args:
            title: The todo title to improve

        Returns:
            Improved title
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a helpful assistant that helps users write better todo items. Make the todo title more specific, actionable, and clear. Keep it concise (under 10 words). Return only the improved title, nothing else.'
                    },
                    {
                        'role': 'user',
                        'content': f'Improve this todo title: "{title}"'
                    }
                ],
                max_tokens=50,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()
        except Exception as e:
            raise Exception(f'Failed to improve title: {str(e)}')

    def generate_suggestions(self, title: str, description: Optional[str] = None) -> Dict[str, str]:
        """
        Generate both improved title and description

        Args:
            title: The todo title
            description: Optional current description

        Returns:
            Dictionary with 'title' and 'description' keys
        """
        try:
            user_content = (
                f'Improve this todo:\nTitle: "{title}"\nDescription: "{description}"'
                if description
                else f'Create a todo with title and description for: "{title}"'
            )

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a helpful assistant that helps users create better todo items. Given a todo title and optional description, suggest an improved version. Return a JSON object with "title" and "description" fields. The title should be actionable and concise (under 10 words). The description should be brief (1-2 sentences) and focused.'
                    },
                    {
                        'role': 'user',
                        'content': user_content
                    }
                ],
                max_tokens=150,
                temperature=0.7,
                response_format={'type': 'json_object'}
            )

            import json
            result = json.loads(response.choices[0].message.content)

            return {
                'title': result.get('title', title),
                'description': result.get('description', '')
            }
        except Exception as e:
            raise Exception(f'Failed to generate suggestions: {str(e)}')

# Create a singleton instance
ai_service = None

def get_ai_service() -> AIService:
    """Get or create AI service instance"""
    global ai_service
    if ai_service is None:
        ai_service = AIService()
    return ai_service
