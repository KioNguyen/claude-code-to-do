# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack todo application with AI-powered suggestions for improving todo titles and generating descriptions. Built with Flask (Python) backend, Next.js (TypeScript) frontend, PostgreSQL database, and OpenAI integration.

## Architecture

### Three-Tier Stack
- **Frontend**: Next.js 14 with TypeScript, TailwindCSS, Shadcn UI, and Axios
- **Backend**: Flask REST API with SQLAlchemy ORM
- **Database**: PostgreSQL 15
- **AI Integration**: OpenAI API for todo suggestions (optional feature)
- **Authentication**: JWT-based authentication with Flask-JWT-Extended

### Key Architectural Points
- Backend runs on port 5000 (5001 in Docker), frontend on port 3000
- CORS is configured for localhost:3000 only
- Database tables auto-created via SQLAlchemy on app startup
- AI service is singleton pattern, lazy-loaded on first use
- Frontend uses API service layer pattern (todoApi, aiService)
- JWT tokens stored in localStorage, automatically attached to requests via Axios interceptors
- All todo and AI endpoints require authentication

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

### Authentication Endpoints (app.py)

- POST /api/auth/register - Register new user (requires: username, email, password)
- POST /api/auth/login - Login user (requires: username, password)
- GET /api/auth/me - Get current user info (requires JWT token)

Returns JWT access_token and user data on successful login/register.

### Todo Endpoints (app.py) **[Requires Authentication]**

- GET /api/todos - List all todos for current user (ordered by created_at desc)
- GET /api/todos/:id - Get single todo
- POST /api/todos - Create todo (requires: title)
- PUT /api/todos/:id - Update todo (optional: title, description, completed)
- DELETE /api/todos/:id - Delete todo

Returns 401 when JWT token is missing or invalid.

### AI Endpoints (app.py + ai_service.py) **[Requires Authentication]**

- POST /api/ai/generate-description - Generate description from title
- POST /api/ai/improve-title - Improve todo title
- POST /api/ai/suggestions - Generate both improved title and description

Returns 401 when JWT token is missing or invalid.
Returns 503 when OPENAI_API_KEY not configured.

## Database Schema

### users table (models.py)

- id (Integer, PK)
- username (String(80), unique, required)
- email (String(120), unique, required)
- password_hash (String(255), required) - bcrypt hashed
- created_at (DateTime)

### todos table (models.py)

- id (Integer, PK)
- title (String(200), required)
- description (Text, optional)
- completed (Boolean, default: False)
- user_id (Integer, FK to users.id, required)
- created_at (DateTime)
- updated_at (DateTime)

Each todo is associated with a user. Users can only access their own todos.

## Frontend Structure

### Pages (pages/)

- index.tsx: Main todo list with filtering (all/active/completed), authentication UI
- _app.tsx: App wrapper with AuthProvider context

### Components (components/)

- TodoForm.tsx: Create new todos with AI suggestions
- TodoItem.tsx: Display/edit/delete individual todos
- LoginForm.tsx: User login form (Shadcn UI)
- RegisterForm.tsx: User registration form (Shadcn UI)

### Contexts (contexts/)

- AuthContext.tsx: Authentication context provider with login/register/logout functions

### Services (services/)

- api.ts: todoApi service for CRUD operations, Axios interceptor for JWT tokens
- aiService.ts: AI suggestion API calls

### Types (types/)

- todo.ts: TypeScript interfaces (Todo, CreateTodoInput, UpdateTodoInput, FilterType)

### Shadcn UI Components (components/ui/)

All UI components follow Shadcn UI patterns:

- Button, Input, Label, Checkbox, Textarea
- Card, Alert, Tabs, Separator
- Uses Tailwind CSS with design tokens from globals.css

## Development Notes

### Adding New API Endpoints

1. Add route handler in backend/app.py
2. Add `@jwt_required_with_user` decorator if authentication is required
3. Update frontend service (api.ts or aiService.ts)
4. Update TypeScript types if needed (frontend/types/)

### Adding New UI Components

When creating new UI components, follow these patterns:

1. **Use Shadcn UI components** from `@/components/ui/*` instead of custom HTML/CSS
2. **Import patterns**:

   ```tsx
   import { Button } from '@/components/ui/button';
   import { Input } from '@/components/ui/input';
   import { Label } from '@/components/ui/label';
   import { Alert, AlertDescription } from '@/components/ui/alert';
   ```

3. **Spacing**: Use Tailwind's `space-y-*` classes for consistent vertical spacing
4. **Error handling**: Use `<Alert variant="destructive">` for error messages
5. **Loading states**: Use `disabled={isLoading}` on buttons and inputs
6. **Icons**: Use `lucide-react` icons for consistency

### Authentication Flow

1. User registers/logs in via LoginForm or RegisterForm
2. Backend returns JWT token and user data
3. Token stored in localStorage
4. Axios interceptor automatically adds token to all requests
5. Protected endpoints return 401 if token is missing/invalid
6. Frontend AuthContext manages user state globally
7. UI components use `useAuth()` hook to access auth state

### Database Changes

Models are in backend/models.py. SQLAlchemy auto-creates tables on startup, but does NOT auto-migrate. For schema changes, either:

- Drop and recreate database (loses data)
- Use Flask-Migrate for proper migrations

### CORS Troubleshooting

CORS is explicitly configured for localhost:3000. Preflight OPTIONS requests are handled in handle_preflight() hook. When adding new endpoints, ensure they're included in the allowed methods.

### AI Features

AI features gracefully degrade when OPENAI_API_KEY is not set. The AIService raises ValueError on initialization without the key, which returns 503 to frontend. Frontend displays user-friendly error messages.

All AI endpoints require authentication - users must be logged in to use AI features.

## Testing Tips

The project doesn't have automated tests yet. When testing manually:

1. Test user registration and login flow
2. Verify JWT tokens are stored and sent correctly
3. Test that unauthenticated users cannot access protected endpoints
4. Verify database connection: GET /api/health
5. Test CRUD operations through frontend UI
6. Test AI features only when OPENAI_API_KEY is configured
7. Check docker-compose logs for backend errors
8. Check browser console for frontend errors

## Session History

### Session: 2025-01-22 - Authentication UI with Shadcn UI

**Completed Work:**

1. **Completed AI Endpoint Authentication** (from previous session)
   - Updated `aiService.ts` to use authenticated API calls
   - Replaced direct axios calls with authenticated `api` instance
   - Added 401 error handling with user-friendly messages

2. **Built Complete Authentication UI**
   - Created `AuthContext.tsx` for global authentication state management
   - Created `LoginForm.tsx` with username/password authentication
   - Created `RegisterForm.tsx` with username/email/password registration
   - Integrated AuthProvider in `_app.tsx` to wrap entire application
   - Updated `index.tsx` with authentication UI:
     - Header with login/logout buttons and user display
     - Auth modal with login/register forms
     - Protected sections (only show todos when authenticated)
     - Alert messages for unauthenticated users

3. **Migrated to Shadcn UI Components**
   - Refactored `LoginForm.tsx` to use Shadcn UI components (Button, Input, Label, Alert)
   - Refactored `RegisterForm.tsx` to use Shadcn UI components
   - Removed custom CSS classes from `globals.css`
   - All forms now use consistent Shadcn UI design system
   - Added proper spacing with Tailwind `space-y-*` classes
   - Enhanced error display with AlertCircle icons

4. **Updated API Error Handling**
   - Updated all error handlers in `index.tsx` to extract axios error messages
   - Pattern: `err.response?.data?.error || err.message || 'Fallback message'`
   - Applied to: fetchTodos, handleAddTodo, handleUpdateTodo, handleDeleteTodo

5. **Documentation Updates**
   - Updated `CLAUDE.md`:
     - Added JWT authentication to architecture section
     - Documented all authentication endpoints
     - Marked protected endpoints with **[Requires Authentication]**
     - Added authentication flow documentation
     - Added "Adding New UI Components" section with Shadcn UI patterns
     - Added database schema for users table
     - Updated frontend structure documentation
   - Updated `README.md`:
     - Added authentication to features list
     - Updated project structure with new files
     - Added Shadcn UI to technology stack
     - Updated usage instructions with registration/login steps
     - Marked API endpoints that require authentication

**Key Technical Decisions:**

- JWT tokens stored in localStorage for simplicity
- Axios interceptor pattern for automatic token attachment
- AuthContext provides global authentication state via React Context
- All UI components now use Shadcn UI for consistency
- Shadcn UI components use Tailwind CSS design tokens
- No custom CSS classes for forms - pure Shadcn UI

**Files Created:**

- `frontend/contexts/AuthContext.tsx`
- `frontend/components/LoginForm.tsx`
- `frontend/components/RegisterForm.tsx`

**Files Modified:**

- `frontend/pages/_app.tsx` - Added AuthProvider wrapper
- `frontend/pages/index.tsx` - Added auth UI and protected sections
- `frontend/services/aiService.ts` - Completed authenticated API calls
- `frontend/styles/globals.css` - Removed custom auth CSS classes
- `CLAUDE.md` - Comprehensive documentation updates
- `README.md` - Updated with authentication features

**Next Steps / Recommendations:**

- Test the complete authentication flow
- Consider adding password strength indicator to RegisterForm
- Consider adding "Remember Me" functionality
- Add token refresh logic before token expiration
- Consider adding email verification flow
- Add loading skeleton components for better UX
- Consider adding toast notifications for success/error messages
