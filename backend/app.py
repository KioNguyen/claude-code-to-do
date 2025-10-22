from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Todo
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/todo_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

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

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
