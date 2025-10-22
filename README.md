# Todo Application

A full-stack todo application built with Flask (Python), PostgreSQL, Next.js, and TailwindCSS.

## Features

- Create, read, update, and delete todos
- Mark todos as completed/incomplete
- Filter todos by status (all, active, completed)
- Modern and responsive UI with TailwindCSS
- RESTful API backend with Flask
- PostgreSQL database for data persistence

## Project Structure

```
todo/
├── backend/           # Flask backend
│   ├── app.py        # Main Flask application
│   ├── models.py     # Database models
│   ├── requirements.txt
│   └── .env.example
├── frontend/          # Next.js frontend
│   ├── pages/        # Next.js pages
│   ├── components/   # React components
│   ├── services/     # API services
│   ├── styles/       # Global styles
│   └── package.json
└── README.md
```

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn

## Backend Setup

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE todo_db;

# Create a user (optional)
CREATE USER todo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;
```

### 3. Set Up Python Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and update with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
```

### 5. Run the Backend

```bash
python app.py
```

The backend will start on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend

# Install npm packages
npm install
```

### 2. Configure Environment Variables

```bash
# Copy .env.local.example to .env.local
cp .env.local.example .env.local

# The default API URL is http://localhost:5000/api
# You can change this if needed
```

### 3. Run the Frontend

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The frontend will start on `http://localhost:3000`

## Usage

1. Start the PostgreSQL database
2. Start the Flask backend (port 5000)
3. Start the Next.js frontend (port 3000)
4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Todos

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

### Health Check

- `GET /api/health` - Check API health

## Technologies Used

### Backend

- Flask - Web framework
- Flask-SQLAlchemy - ORM for database operations
- Flask-CORS - Cross-origin resource sharing
- PostgreSQL - Database
- psycopg2 - PostgreSQL adapter

### Frontend

- Next.js - React framework
- React - UI library
- TailwindCSS - Utility-first CSS framework
- Axios - HTTP client

## Development

### Backend Development

The Flask app runs in debug mode by default. Any changes to Python files will automatically reload the server.

### Frontend Development

Next.js runs in development mode with hot reloading. Changes to React components will be reflected immediately.

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### CORS Issues

- Ensure Flask-CORS is installed
- Check that the backend is running on port 5000
- Verify the API URL in frontend `.env.local`

### Frontend Not Loading

- Check that both backend and frontend are running
- Verify no port conflicts (3000 for frontend, 5000 for backend)
- Check browser console for errors

## License

MIT
