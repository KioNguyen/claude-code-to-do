"""
Authentication Service
Handles JWT token generation, validation, and authentication utilities
"""
from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from models import User, db
import re


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """
    Validate password strength
    Requirements:
    - At least 8 characters
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"

    return True, "Password is valid"


def validate_username(username):
    """
    Validate username format
    Requirements:
    - 3-80 characters
    - Only alphanumeric and underscores
    """
    if len(username) < 3 or len(username) > 80:
        return False, "Username must be between 3 and 80 characters"

    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"

    return True, "Username is valid"


def jwt_required_with_user(fn):
    """
    Custom decorator that verifies JWT and loads the user
    Returns 401 if token is invalid
    Returns 404 if user not found
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        from flask_jwt_extended import jwt_required as jwt_required_original

        # First verify JWT using the original decorator
        @jwt_required_original()
        def inner(*args, **kwargs):
            user_id = get_jwt_identity()

            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404

            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 403

            # Add user to kwargs
            kwargs['current_user'] = user
            return fn(*args, **kwargs)

        return inner(*args, **kwargs)

    return wrapper


def optional_jwt_with_user(fn):
    """
    Custom decorator that optionally verifies JWT
    If token is present and valid, loads the user
    If no token, continues without user
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()

            if user_id:
                user = User.query.get(user_id)
                if user and user.is_active:
                    kwargs['current_user'] = user
                else:
                    kwargs['current_user'] = None
            else:
                kwargs['current_user'] = None

            return fn(*args, **kwargs)

        except Exception:
            kwargs['current_user'] = None
            return fn(*args, **kwargs)

    return wrapper


def send_password_reset_email(user, reset_token):
    """
    Send password reset email to user
    In a production environment, this would integrate with an email service
    For now, we'll just log the token (in development) or return it
    """
    # TODO: Integrate with Flask-Mail or another email service
    # For development, we'll just log it
    reset_url = f"http://localhost:3000/reset-password?token={reset_token}"

    print(f"=" * 60)
    print(f"Password Reset Email for: {user.email}")
    print(f"Reset URL: {reset_url}")
    print(f"Token: {reset_token}")
    print(f"=" * 60)

    # In production, you would send an actual email here
    # Example:
    # from flask_mail import Message, Mail
    # msg = Message(
    #     'Password Reset Request',
    #     sender='noreply@todoapp.com',
    #     recipients=[user.email]
    # )
    # msg.body = f'Click the link to reset your password: {reset_url}'
    # mail.send(msg)

    return True


def send_verification_email(user):
    """
    Send email verification to user
    In production, this would send an actual email
    """
    # TODO: Implement email verification
    print(f"Verification email would be sent to: {user.email}")
    return True
