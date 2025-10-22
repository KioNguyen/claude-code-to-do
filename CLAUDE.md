# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack todo application with AI-powered suggestions for improving todo titles and generating descriptions. Built with Flask (Python) backend, Next.js (TypeScript) frontend, PostgreSQL database, and OpenAI integration.

## Architecture

### Three-Tier Stack
- **Frontend**: Next.js 14 with TypeScript, TailwindCSS, and Axios
- **Backend**: Flask REST API with SQLAlchemy ORM
- **Database**: PostgreSQL 15
- **AI Integration**: OpenAI API for todo suggestions (optional feature)

### Key Architectural Points
- Backend runs on port 5000 (5001 in Docker), frontend on port 3000
- CORS is configured for localhost:3000 only
- Database tables auto-created via SQLAlchemy on app startup
- AI service is singleton pattern, lazy-loaded on first use
- Frontend uses API service layer pattern (todoApi, aiService)

## Development Commands

### Docker (Recommended)
```bash
# Start all services (backend, frontend, database)
docker-compose up -d

# Development mode with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Rebuild after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f [backend|frontend|db]

# Stop services
docker-compose down

# Stop and remove all data including database
docker-compose down -v
```

### Backend Development (Manual)
```bash
cd backend

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask app (debug mode, auto-reload enabled)
python app.py
```

### Frontend Development (Manual)
```bash
cd frontend

# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

## Environment Configuration

### Backend (.env)
Required:
- `DATABASE_URL`: PostgreSQL connection string (format: postgresql://user:password@host:port/db_name)

Optional (for AI features):
- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_MODEL`: Model to use (default: gpt-3.5-turbo)
- `OPENAI_API_URL`: Custom API endpoint (default: https://api.openai.com/v1)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:5000/api)

### Docker Port Mapping
In docker-compose.yml, backend is mapped to port 5001 (not 5000) to avoid conflicts. Update NEXT_PUBLIC_API_URL to http://localhost:5001/api when running in Docker.

## API Structure

### Todo Endpoints (app.py)
- GET /api/todos - List all todos (ordered by created_at desc)
- GET /api/todos/:id - Get single todo
- POST /api/todos - Create todo (requires: title)
- PUT /api/todos/:id - Update todo (optional: title, description, completed)
- DELETE /api/todos/:id - Delete todo

### AI Endpoints (app.py + ai_service.py)
- POST /api/ai/generate-description - Generate description from title
- POST /api/ai/improve-title - Improve todo title
- POST /api/ai/suggestions - Generate both improved title and description

Returns 503 when OPENAI_API_KEY not configured.

## Database Schema

Single table: `todos` (models.py)
- id (Integer, PK)
- title (String(200), required)
- description (Text, optional)
- completed (Boolean, default: False)
- created_at (DateTime)
- updated_at (DateTime)

## Frontend Structure

### Pages (pages/)
- index.tsx: Main todo list with filtering (all/active/completed)

### Components (components/)
- TodoForm.tsx: Create new todos with AI suggestions
- TodoItem.tsx: Display/edit/delete individual todos

### Services (services/)
- api.ts: todoApi service for CRUD operations
- aiService.ts: AI suggestion API calls

### Types (types/)
- todo.ts: TypeScript interfaces (Todo, CreateTodoInput, UpdateTodoInput, FilterType)

## Development Notes

### Adding New API Endpoints
1. Add route handler in backend/app.py
2. Update frontend service (api.ts or aiService.ts)
3. Update TypeScript types if needed (frontend/types/)

### Database Changes
Models are in backend/models.py. SQLAlchemy auto-creates tables on startup, but does NOT auto-migrate. For schema changes, either:
- Drop and recreate database (loses data)
- Use Flask-Migrate for proper migrations

### CORS Troubleshooting
CORS is explicitly configured for localhost:3000. Preflight OPTIONS requests are handled in handle_preflight() hook. When adding new endpoints, ensure they're included in the allowed methods.

### AI Features
AI features gracefully degrade when OPENAI_API_KEY is not set. The AIService raises ValueError on initialization without the key, which returns 503 to frontend. Frontend displays user-friendly error messages.

## Testing Tips

The project doesn't have automated tests yet. When testing manually:
1. Verify database connection: GET /api/health
2. Test CRUD operations through frontend UI
3. Test AI features only when OPENAI_API_KEY is configured
4. Check docker-compose logs for backend errors
5. Check browser console for frontend errors
