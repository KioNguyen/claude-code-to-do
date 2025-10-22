"""
Authentication Routes
Handles all authentication-related endpoints: register, login, password reset
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import User, db
from auth_service import (
    validate_email,
    validate_password,
    validate_username,
    send_password_reset_email,
    jwt_required_with_user
)
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    Required fields: email, username, password
    Optional fields: first_name, last_name
    """
    data = request.get_json()

    # Validate required fields
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()

    # Validate required fields
    if not email or not username or not password:
        return jsonify({'error': 'Email, username, and password are required'}), 400

    # Validate email format
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    # Validate username
    is_valid, message = validate_username(username)
    if not is_valid:
        return jsonify({'error': message}), 400

    # Validate password strength
    is_valid, message = validate_password(password)
    if not is_valid:
        return jsonify({'error': message}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409

    try:
        # Create new user
        user = User(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Generate JWT tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(include_email=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user and return JWT tokens
    Required fields: email or username, password
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Allow login with either email or username
    identifier = data.get('email') or data.get('username')
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'error': 'Email/username and password are required'}), 400

    identifier = identifier.strip().lower()

    try:
        # Find user by email or username
        user = User.query.filter(
            (User.email == identifier) | (User.username == identifier)
        ).first()

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403

        # Verify password
        if not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Generate JWT tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(include_email=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token
    """
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)

        return jsonify({
            'access_token': access_token
        }), 200

    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required_with_user
def get_current_user(current_user):
    """
    Get current authenticated user's profile
    """
    return jsonify({
        'user': current_user.to_dict(include_email=True)
    }), 200


@auth_bp.route('/me', methods=['PUT'])
@jwt_required_with_user
def update_current_user(current_user):
    """
    Update current user's profile
    Allowed fields: first_name, last_name, username
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        # Update allowed fields
        if 'first_name' in data:
            current_user.first_name = data['first_name'].strip()

        if 'last_name' in data:
            current_user.last_name = data['last_name'].strip()

        if 'username' in data:
            new_username = data['username'].strip()

            # Validate username
            is_valid, message = validate_username(new_username)
            if not is_valid:
                return jsonify({'error': message}), 400

            # Check if username is taken (excluding current user)
            existing_user = User.query.filter(
                User.username == new_username,
                User.id != current_user.id
            ).first()

            if existing_user:
                return jsonify({'error': 'Username already taken'}), 409

            current_user.username = new_username

        db.session.commit()

        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict(include_email=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Update failed: {str(e)}'}), 500


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required_with_user
def change_password(current_user):
    """
    Change user's password
    Required fields: current_password, new_password
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required'}), 400

    # Verify current password
    if not current_user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401

    # Validate new password
    is_valid, message = validate_password(new_password)
    if not is_valid:
        return jsonify({'error': message}), 400

    try:
        current_user.set_password(new_password)
        db.session.commit()

        return jsonify({
            'message': 'Password changed successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Password change failed: {str(e)}'}), 500


@auth_bp.route('/password-reset/request', methods=['POST'])
def request_password_reset():
    """
    Request a password reset
    Required field: email
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    try:
        user = User.query.filter_by(email=email).first()

        # Always return success even if user doesn't exist (security best practice)
        if user:
            # Generate reset token
            reset_token = user.generate_reset_token()
            db.session.commit()

            # Send reset email
            send_password_reset_email(user, reset_token)

        return jsonify({
            'message': 'If the email exists, a password reset link has been sent'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Password reset request failed: {str(e)}'}), 500


@auth_bp.route('/password-reset/confirm', methods=['POST'])
def confirm_password_reset():
    """
    Confirm password reset with token
    Required fields: token, new_password
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    # Validate new password
    is_valid, message = validate_password(new_password)
    if not is_valid:
        return jsonify({'error': message}), 400

    try:
        # Find user with this reset token
        user = User.query.filter_by(reset_token=token).first()

        if not user:
            return jsonify({'error': 'Invalid or expired reset token'}), 400

        # Verify token is valid and not expired
        if not user.verify_reset_token(token):
            return jsonify({'error': 'Invalid or expired reset token'}), 400

        # Update password
        user.set_password(new_password)
        user.clear_reset_token()
        db.session.commit()

        return jsonify({
            'message': 'Password has been reset successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Password reset failed: {str(e)}'}), 500


@auth_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    """
    Validate if the current JWT token is valid
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_active:
            return jsonify({'valid': False, 'error': 'Invalid user'}), 401

        return jsonify({
            'valid': True,
            'user_id': user_id
        }), 200

    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 401
