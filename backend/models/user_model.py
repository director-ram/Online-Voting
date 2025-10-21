from models import execute_query
from werkzeug.security import generate_password_hash, check_password_hash


class User:
	@staticmethod
	def create(name, email, password, role='user'):
		"""Create a new user"""
		hashed_password = generate_password_hash(password)
		query = """
			INSERT INTO users (name, email, password, role, status)
			VALUES (%s, %s, %s, %s, 'active')
			RETURNING id
		"""
		row = execute_query(query, (name, email, hashed_password, role), returning=True)
		if row is None:
			return None
		return row["id"] if isinstance(row, dict) else (row[0] if isinstance(row, (list, tuple)) else row)

	@staticmethod
	def find_by_email(email):
		"""Find a user by email"""
		query = "SELECT * FROM users WHERE email = %s"
		return execute_query(query, (email,), fetch_one=True)

	@staticmethod
	def find_by_id(user_id):
		"""Find a user by ID"""
		# Try to include profile_pic; if column doesn't exist, fall back to basic query
		try:
			query = "SELECT id, name, email, role, status, profile_pic FROM users WHERE id = %s"
			return execute_query(query, (user_id,), fetch_one=True)
		except Exception as e:
			# If profile_pic column doesn't exist, use basic query
			if 'profile_pic' in str(e):
				query = "SELECT id, name, email, role, status FROM users WHERE id = %s"
				return execute_query(query, (user_id,), fetch_one=True)
			raise

	@staticmethod
	def verify_password(stored_password, provided_password):
		"""Verify password hash"""
		return check_password_hash(stored_password, provided_password)

	@staticmethod
	def update_status(user_id, status):
		"""Update user status"""
		query = "UPDATE users SET status = %s WHERE id = %s"
		return execute_query(query, (status, user_id))

	@staticmethod
	def update_profile_pic(user_id, profile_path) -> bool:
		"""Update user's profile picture path. Returns True if updated, False if column doesn't exist."""
		try:
			query = "UPDATE users SET profile_pic = %s WHERE id = %s"
			execute_query(query, (profile_path, user_id))
			return True
		except Exception:
			# Column may not exist; treat as non-fatal and return False
			return False

	@staticmethod
	def update_profile(user_id, name=None, dob=None, gender=None) -> dict:
		"""Update profile fields individually with graceful fallback if columns are missing.
		Returns a dict of persisted flags per field.
		"""
		results = { 'name': False, 'dob': False, 'gender': False }

		if name is not None:
			try:
				execute_query("UPDATE users SET name = %s WHERE id = %s", (name, user_id))
				results['name'] = True
			except Exception:
				results['name'] = False

		if dob is not None:
			try:
				execute_query("UPDATE users SET dob = %s WHERE id = %s", (dob, user_id))
				results['dob'] = True
			except Exception:
				results['dob'] = False

		if gender is not None:
			try:
				execute_query("UPDATE users SET gender = %s WHERE id = %s", (gender, user_id))
				results['gender'] = True
			except Exception:
				results['gender'] = False

		return results

__all__ = ['User']

