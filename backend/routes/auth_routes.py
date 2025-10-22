from flask import Blueprint, request, jsonify
from models.user_model import User
from config import Config
from datetime import datetime
from functools import wraps
import jwt
import os
from werkzeug.utils import secure_filename
from utils.cloudinary_config import upload_image_to_cloudinary

auth_bp = Blueprint('auth', __name__)

# Uploads folder (reuse same profiles directory as candidates)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'profiles')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def _allowed_file(filename: str) -> bool:
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def token_required(f):
	"""Decorator to protect routes with JWT"""
	@wraps(f)
	def decorated(*args, **kwargs):
		token = None

		if 'Authorization' in request.headers:
			auth_header = request.headers['Authorization']
			try:
				token = auth_header.split(" ")[1]  # Bearer <token>
			except IndexError:
				return jsonify({'error': {'code': 'INVALID_TOKEN', 'message': 'Invalid token format'}}), 401

		if not token:
			return jsonify({'error': {'code': 'NO_TOKEN', 'message': 'Token is missing'}}), 401

		try:
			data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
			current_user = User.find_by_id(data['user_id'])
			if not current_user:
				return jsonify({'error': {'code': 'USER_NOT_FOUND', 'message': 'User not found'}}), 401
		except jwt.ExpiredSignatureError:
			return jsonify({'error': {'code': 'TOKEN_EXPIRED', 'message': 'Token has expired'}}), 401
		except jwt.InvalidTokenError:
			return jsonify({'error': {'code': 'INVALID_TOKEN', 'message': 'Token is invalid'}}), 401

		return f(current_user, *args, **kwargs)

	return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
	"""Register a new user"""
	try:
		data = request.get_json()

		# Validation
		if not data.get('name') or not data.get('email') or not data.get('password'):
			return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Missing required fields'}}), 400

		# Check if user already exists
		existing_user = User.find_by_email(data['email'])
		if existing_user:
			return jsonify({'error': {'code': 'USER_EXISTS', 'message': 'Email already registered'}}), 400

		# Create user
		user_id = User.create(data['name'], data['email'], data['password'])

		# Generate JWT token for immediate login after registration
		token = jwt.encode({
			'user_id': user_id,
			'exp': datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES
		}, Config.JWT_SECRET_KEY, algorithm="HS256")

		return jsonify({
			'accessToken': token,
			'user': {
				'id': user_id,
				'name': data['name'],
				'email': data['email'],
				'role': 'user'
			}
		}), 201

	except Exception as e:
		return jsonify({'error': {'code': 'SERVER_ERROR', 'message': str(e)}}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
	"""Login user"""
	try:
		data = request.get_json()
		print(f"\n🔍 Login attempt for: {data.get('email')}")

		if not data.get('email') or not data.get('password'):
			return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Email and password required'}}), 400

		user = User.find_by_email(data['email'])
		print(f"✅ User found: {user is not None}")
		if not user:
			# Return a clear error code so frontend can show a friendly, themed message
			return jsonify({'error': {'code': 'USER_NOT_FOUND', 'message': 'No account found with this email'}}), 401

		# Handle different return types (dict or tuple/list)
		if isinstance(user, dict):
			user_id = user.get('id')
			user_name = user.get('name')
			user_email = user.get('email')
			user_password = user.get('password')
			user_role = user.get('role', 'user')
			user_status = user.get('status', 'active')
		elif isinstance(user, (tuple, list)):
			user_id = user[0]
			user_name = user[1]
			user_email = user[2]
			user_password = user[3]
			user_role = user[4] if len(user) > 4 else 'user'
			user_status = user[5] if len(user) > 5 else 'active'
		else:
			return jsonify({'error': {'code': 'SERVER_ERROR', 'message': 'Invalid user data format'}}), 500

		# Verify password
		print(f"🔑 Verifying password...")
		if not User.verify_password(user_password, data['password']):
			print(f"❌ Password verification failed")
			return jsonify({'error': {'code': 'INVALID_CREDENTIALS', 'message': 'Invalid credentials'}}), 401
		print(f"✅ Password verified!")

		# Check user status
		if user_status != 'active':
			return jsonify({'error': {'code': 'ACCOUNT_INACTIVE', 'message': 'Account is inactive'}}), 401

		# Generate JWT token
		print(f"🎫 Generating token...")
		token = jwt.encode({
			'user_id': user_id,
			'exp': datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES
		}, Config.JWT_SECRET_KEY, algorithm="HS256")
		print(f"✅ Token generated!")

		print(f"📤 Sending successful response")
		return jsonify({
			'accessToken': token,
			'user': {
				'id': user_id,
				'name': user_name,
				'email': user_email,
				'role': user_role
			}
		}), 200

	except Exception as e:
		print(f"❌ LOGIN ERROR: {str(e)}")
		import traceback
		traceback.print_exc()
		return jsonify({'error': {'code': 'SERVER_ERROR', 'message': str(e)}}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
	"""Get current user information"""
	if isinstance(current_user, dict):
		return jsonify({
			'id': current_user.get('id'),
			'name': current_user.get('name'),
			'email': current_user.get('email'),
			'role': current_user.get('role', 'user'),
			'profile_pic': current_user.get('profile_pic')
		}), 200
	elif isinstance(current_user, (list, tuple)):
		return jsonify({
			'id': current_user[0] if len(current_user) > 0 else None,
			'name': current_user[1] if len(current_user) > 1 else None,
			'email': current_user[2] if len(current_user) > 2 else None,
			'role': current_user[3] if len(current_user) > 3 else 'user',
			'profile_pic': current_user[5] if len(current_user) > 5 else None
		}), 200
	else:
		return jsonify({'error': {'code': 'USER_CONTEXT_ERROR', 'message': 'Unable to resolve current user'}}), 500

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
	"""Logout user (client-side token removal)"""
	return '', 204

@auth_bp.route('/profile/picture', methods=['POST'])
@token_required
def upload_profile_picture(current_user):
	"""Upload or change the current user's profile picture.
	Expects multipart/form-data with field name 'profile_pic'.
	Returns the public URL path of the stored picture.
	"""
	# Resolve user id from tuple/dict
	if isinstance(current_user, dict):
		user_id = current_user.get('id')
	elif isinstance(current_user, (list, tuple)):
		user_id = current_user[0] if len(current_user) > 0 else None
	else:
		user_id = None
	if not user_id:
		return jsonify({'error': {'code': 'USER_CONTEXT_ERROR', 'message': 'Unable to resolve current user'}}), 401

	if 'profile_pic' not in request.files:
		return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'File field "profile_pic" is required'}}), 400

	file = request.files['profile_pic']
	if not file or not file.filename:
		return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'No file provided'}}), 400
	if not _allowed_file(file.filename):
		return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Unsupported file type'}}), 400

	# Upload to Cloudinary instead of local filesystem
	upload_result = upload_image_to_cloudinary(file, folder="voting-system/profiles")
	
	if not upload_result:
		return jsonify({'error': {'code': 'UPLOAD_ERROR', 'message': 'Failed to upload image to cloud storage'}}), 500
	
	# Get the secure URL from Cloudinary
	public_path = upload_result['url']

	# Try to persist in users.profile_pic if the column exists
	persisted = User.update_profile_pic(user_id, public_path)

	return jsonify({
		'message': 'Profile picture updated' if persisted else 'Profile picture uploaded',
		'profile_pic': public_path,
		'persisted': persisted
	}), 200


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
	"""Update user's basic profile fields (name, dob, gender)."""
	# Resolve id
	if isinstance(current_user, dict):
		user_id = current_user.get('id')
	elif isinstance(current_user, (list, tuple)):
		user_id = current_user[0] if len(current_user) > 0 else None
	else:
		user_id = None
	if not user_id:
		return jsonify({'error': {'code': 'USER_CONTEXT_ERROR', 'message': 'Unable to resolve current user'}}), 401

	data = request.get_json(silent=True) or {}
	name = data.get('name')
	dob = data.get('dob')  # expect ISO/date string
	gender = data.get('gender')

	results = User.update_profile(user_id, name=name, dob=dob, gender=gender)
	return jsonify({ 'updated': results }), 200

__all__ = ["token_required", "auth_bp"]
