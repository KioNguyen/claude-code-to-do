from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Todo
from dotenv import load_dotenv
import os
from ai_service import get_ai_service

load_dotenv()

app = Flask(__name__)

# Configure CORS to allow requests from localhost:3000
CORS(app, 
     origins=['http://localhost:3000'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/todo_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Add explicit OPTIONS handler for preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todos"""
    todos = Todo.query.order_by(Todo.created_at.desc()).all()
    return jsonify([todo.to_dict() for todo in todos]), 200

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by ID"""
    todo = Todo.query.get_or_404(todo_id)
    return jsonify(todo.to_dict()), 200

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo"""
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400

    todo = Todo(
        title=data['title'],
        description=data.get('description', ''),
        completed=data.get('completed', False)
    )

    db.session.add(todo)
    db.session.commit()

    return jsonify(todo.to_dict()), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update an existing todo"""
    todo = Todo.query.get_or_404(todo_id)
    data = request.get_json()

    if 'title' in data:
        todo.title = data['title']
    if 'description' in data:
        todo.description = data['description']
    if 'completed' in data:
        todo.completed = data['completed']

    db.session.commit()

    return jsonify(todo.to_dict()), 200

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo"""
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()

    return jsonify({'message': 'Todo deleted successfully'}), 200

# AI Suggestion Endpoints
@app.route('/api/ai/generate-description', methods=['POST'])
def generate_description():
    """Generate a description for a todo based on its title"""
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400

    try:
        ai = get_ai_service()
        description = ai.generate_description(data['title'])
        return jsonify({'description': description}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': f'Failed to generate description: {str(e)}'}), 500

@app.route('/api/ai/improve-title', methods=['POST'])
def improve_title():
    """Improve a todo title"""
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400

    try:
        ai = get_ai_service()
        improved_title = ai.improve_todo_title(data['title'])
        return jsonify({'title': improved_title}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': f'Failed to improve title: {str(e)}'}), 500

@app.route('/api/ai/suggestions', methods=['POST'])
def get_suggestions():
    """Get AI suggestions for both title and description"""
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400

    try:
        ai = get_ai_service()
        suggestions = ai.generate_suggestions(
            data['title'],
            data.get('description')
        )
        return jsonify(suggestions), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': f'Failed to generate suggestions: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
