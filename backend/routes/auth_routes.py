from flask import Blueprint, request, jsonify, redirect, make_response
from models.user_model import User
from config import Config
from datetime import datetime
from functools import wraps
import jwt
import os
from werkzeug.utils import secure_filename
from utils.cloudinary_config import upload_image_to_cloudinary
import secrets
import requests

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

# ------------------ GOOGLE OAUTH 2.0 ------------------

GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"

def _google_enabled():
	return bool(Config.GOOGLE_CLIENT_ID and Config.GOOGLE_CLIENT_SECRET and Config.GOOGLE_REDIRECT_URI)

@auth_bp.route('/google/start', methods=['GET'])
def google_start():
	"""Start Google OAuth flow by redirecting to Google's consent screen."""
	if not _google_enabled():
		return jsonify({'error': {'code': 'OAUTH_NOT_CONFIGURED', 'message': 'Google OAuth not configured'}}), 400

	scope = 'openid email profile'
	state = secrets.token_urlsafe(16)  # Optionally validate via client later
	params = {
		'client_id': Config.GOOGLE_CLIENT_ID,
		'redirect_uri': Config.GOOGLE_REDIRECT_URI,
		'response_type': 'code',
		'scope': scope,
		'access_type': 'online',
		'include_granted_scopes': 'true',
		'prompt': 'select_account',
		'state': state,
	}
	# Build URL
	from urllib.parse import urlencode
	url = f"{GOOGLE_AUTH_BASE}?{urlencode(params)}"
	return redirect(url, code=302)

@auth_bp.route('/google/callback', methods=['GET'])
def google_callback():
	"""Handle OAuth callback: exchange code, fetch profile, upsert user, issue JWT, and postMessage to opener."""
	if not _google_enabled():
		return jsonify({'error': {'code': 'OAUTH_NOT_CONFIGURED', 'message': 'Google OAuth not configured'}}), 400

	error = request.args.get('error')
	if error:
		return _oauth_popup_response(success=False, message=error)

	code = request.args.get('code')
	if not code:
		return _oauth_popup_response(success=False, message='Missing authorization code')

	try:
		# Exchange code for tokens
		data = {
			'code': code,
			'client_id': Config.GOOGLE_CLIENT_ID,
			'client_secret': Config.GOOGLE_CLIENT_SECRET,
			'redirect_uri': Config.GOOGLE_REDIRECT_URI,
			'grant_type': 'authorization_code'
		}
		token_resp = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=10)
		token_resp.raise_for_status()
		tokens = token_resp.json()
		access_token = tokens.get('access_token')
		if not access_token:
			return _oauth_popup_response(success=False, message='No access token from Google')

		# Fetch userinfo
		userinfo_resp = requests.get(GOOGLE_USERINFO_URL, headers={'Authorization': f'Bearer {access_token}'}, timeout=10)
		userinfo_resp.raise_for_status()
		info = userinfo_resp.json()

		email = info.get('email')
		name = info.get('name') or (info.get('given_name') or 'New User')
		picture = info.get('picture')
		if not email:
			return _oauth_popup_response(success=False, message='No email permission granted')

		# Upsert user
		existing = User.find_by_email(email)
		if existing:
			# Resolve id/name/email/role/status from tuple/list/dict safely
			if isinstance(existing, dict):
				user_id = existing.get('id')
				user_name = existing.get('name') or name
				user_email = existing.get('email')
				user_role = existing.get('role', 'user')
				user_status = existing.get('status', 'active')
			elif isinstance(existing, (tuple, list)):
				user_id = existing[0] if len(existing) > 0 else None
				user_name = (existing[1] if len(existing) > 1 else None) or name
				user_email = existing[2] if len(existing) > 2 else email
				user_role = existing[4] if len(existing) > 4 else 'user'
				user_status = existing[5] if len(existing) > 5 else 'active'
			else:
				# Fallback: unknown shape, try treating as id
				user_id = existing if isinstance(existing, int) else None
				user_name = name
				user_email = email
				user_role = 'user'
				user_status = 'active'
		else:
			# Create with a random password
			random_password = secrets.token_urlsafe(16)
			user_id = User.create(name, email, random_password)
			user_name = name
			user_email = email
			user_role = 'user'
			user_status = 'active'

		# Save profile picture if provided
		if picture and user_id:
			try:
				User.update_profile_pic(user_id, picture)
			except Exception:
				pass

		if user_status != 'active':
			return _oauth_popup_response(success=False, message='Account is inactive')

		# Issue JWT like password login
		token = jwt.encode({
			'user_id': user_id,
			'exp': datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES
		}, Config.JWT_SECRET_KEY, algorithm="HS256")

		user_payload = {
			'id': user_id,
			'name': user_name,
			'email': user_email,
			'role': user_role,
			'profile_pic': picture
		}
		return _oauth_popup_response(success=True, token=token, user=user_payload)

	except requests.HTTPError as he:
		return _oauth_popup_response(success=False, message=f'HTTP error: {str(he)}')
	except Exception as e:
		return _oauth_popup_response(success=False, message=str(e))


from typing import Optional, Dict

def _oauth_popup_response(success: bool, message: Optional[str] = None, token: Optional[str] = None, user: Optional[Dict] = None):
		"""Return a tiny HTML page that posts a message back to the opener and closes the window."""
		# Determine allowed target origin for postMessage
		target_origin = Config.FRONTEND_BASE_URL or '*'
		payload = {
				'type': 'google-auth-success' if success else 'google-auth-error',
				'message': message,
				'token': token,
				'user': user
		}
		import json as _json
		payload_json = _json.dumps(payload)
		origin_json = _json.dumps(target_origin)
		html = f"""<!DOCTYPE html>
<html><head><meta charset='utf-8'><title>Google Auth</title></head>
<body style=\"font-family: system-ui, sans-serif; padding: 24px;\">
<p>{'Success! You can close this window.' if success else 'Authentication failed. You can close this window.'}</p>
<script>
	(function() {{
		var payload = {payload_json};
		try {{
			if (window.opener && !window.opener.closed) {{
				window.opener.postMessage(payload, {origin_json});
			}}
		}} catch (e) {{}}
		window.close();
	}})();
</script>
</body></html>"""
		resp = make_response(html)
		resp.headers['Content-Type'] = 'text/html; charset=utf-8'
		return resp

# Debug endpoint to check OAuth configuration
@auth_bp.route('/google/debug', methods=['GET'])
def google_debug():
	"""Debug endpoint to verify OAuth configuration"""
	return jsonify({
		'google_enabled': _google_enabled(),
		'client_id': Config.GOOGLE_CLIENT_ID[:20] + '...' if Config.GOOGLE_CLIENT_ID else None,
		'redirect_uri': Config.GOOGLE_REDIRECT_URI,
		'backend_base_url': Config.BACKEND_BASE_URL,
		'frontend_base_url': Config.FRONTEND_BASE_URL,
		'render_external_url': os.getenv('RENDER_EXTERNAL_URL'),
		'message': 'Check if redirect_uri uses HTTPS'
	}), 200
