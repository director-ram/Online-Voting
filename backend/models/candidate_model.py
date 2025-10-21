from models import execute_query


class Candidate:
	@staticmethod
	def get_all():
		"""Get all active candidates WITHOUT vote counts (for public view)"""
		query = """
			SELECT c.id, c.name, c.party, c.position, c.user_id, c.description, c.is_active,
				   c.dob, c.gender, c.profile_pic,
				   u.name as user_name, u.email
			FROM candidates c
			LEFT JOIN users u ON c.user_id = u.id
			WHERE c.is_active = true
			ORDER BY c.name
		"""
		return execute_query(query, fetch=True)

	@staticmethod
	def get_by_id(candidate_id):
		"""Get candidate by ID"""
		query = "SELECT * FROM candidates WHERE id = %s"
		return execute_query(query, (candidate_id,), fetch_one=True)

	@staticmethod
	def get_by_user_id(user_id):
		"""Get candidate by user ID with vote count for TODAY (daily voting)"""
		query = """
			SELECT c.id, c.name, c.party, c.position, c.user_id, c.description, c.is_active,
				   c.dob, c.gender, c.profile_pic, c.created_at,
				   u.name as user_name, u.email,
				   COUNT(v.id) as vote_count
			FROM candidates c
			LEFT JOIN users u ON c.user_id = u.id
			LEFT JOIN votes v ON c.id = v.candidate_id AND v.vote_date = CURRENT_DATE
			WHERE c.user_id = %s
			GROUP BY c.id, c.name, c.party, c.position, c.user_id, c.description, c.is_active,
					 c.dob, c.gender, c.profile_pic, c.created_at, u.name, u.email
		"""
		return execute_query(query, (user_id,), fetch_one=True)

	@staticmethod
	def create_from_user(user_id, description, candidate_name=None, dob=None, gender=None, party='Independent', profile_pic=None):
		"""Create a candidate from an existing user with detailed information"""
		# Check if user is already a candidate
		check_query = "SELECT id FROM candidates WHERE user_id = %s"
		existing = execute_query(check_query, (user_id,), fetch_one=True)

		if existing:
			return None  # Already a candidate

		# If candidate_name not provided, get from user
		if not candidate_name:
			user_query = "SELECT name FROM users WHERE id = %s"
			user = execute_query(user_query, (user_id,), fetch_one=True)

			if not user:
				return None

			# Handle different return types from execute_query
			if isinstance(user, dict):
				candidate_name = user.get('name', 'Unknown')
			elif isinstance(user, (tuple, list)) and len(user) > 0:
				candidate_name = user[0]
			else:
				candidate_name = 'Unknown'

		# Create candidate entry with all fields
		query = """
			INSERT INTO candidates (user_id, name, description, is_active, party, position, dob, gender, profile_pic)
			VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
			RETURNING id
		"""

		row = execute_query(
			query,
			(user_id, candidate_name, description, True, party or 'Independent', 'Candidate', dob, gender, profile_pic),
			returning=True
		)

		if row is None:
			return None
		return row["id"] if isinstance(row, dict) else (row[0] if isinstance(row, (list, tuple)) else row)

	@staticmethod
	def create(name, party, position):
		"""Create a new candidate (admin function)"""
		query = """
			INSERT INTO candidates (name, party, position, is_active)
			VALUES (%s, %s, %s, %s)
			RETURNING id
		"""
		row = execute_query(query, (name, party, position, True), returning=True)
		if row is None:
			return None
		return row["id"] if isinstance(row, dict) else (row[0] if isinstance(row, (list, tuple)) else row)

	@staticmethod
	def update(candidate_id, name, party, position):
		"""Update a candidate"""
		query = """
			UPDATE candidates
			SET name = %s, party = %s, position = %s
			WHERE id = %s
		"""
		return execute_query(query, (name, party, position, candidate_id))

	@staticmethod
	def delete(candidate_id):
		"""Delete a candidate"""
		query = "DELETE FROM candidates WHERE id = %s"
		return execute_query(query, (candidate_id,))

	@staticmethod
	def get_vote_count(user_id):
		"""Get vote count for TODAY for the candidate owned by the given user_id.
		This counts votes where votes.candidate_id = candidates.id AND candidates.user_id = user_id
		AND vote_date = CURRENT_DATE (daily voting).
		"""
		query = (
			"""
			SELECT COUNT(v.id) AS vote_count
			FROM candidates c
			LEFT JOIN votes v ON v.candidate_id = c.id AND v.vote_date = CURRENT_DATE
			WHERE c.user_id = %s
			"""
		)
		result = execute_query(query, (user_id,), fetch_one=True)

		if isinstance(result, dict):
			# RealDictRow with explicit alias
			value = result.get('vote_count', 0)
			try:
				return int(value) if value is not None else 0
			except Exception:
				return 0
		# Fallbacks (should not occur with RealDictCursor)
		return 0

	@staticmethod
	def revoke_candidacy(user_id):
		"""Revoke (deactivate) a candidate application and delete all votes"""
		try:
			# Check if user is an active candidate
			check_query = "SELECT id, is_active FROM candidates WHERE user_id = %s"
			existing = execute_query(check_query, (user_id,), fetch_one=True)

			if not existing:
				return False  # Not a candidate

			# Extract candidate_id and is_active status
			if isinstance(existing, dict):
				is_active = existing.get('is_active', False)
				candidate_id = existing.get('id')
			elif isinstance(existing, (tuple, list)) and len(existing) >= 1:
				candidate_id = existing[0]
				is_active = existing[1] if len(existing) > 1 else False
			else:
				return False

			if not is_active:
				return False  # Already inactive

			# First, delete all vote records for this candidate
			if candidate_id:
				delete_votes_query = "DELETE FROM votes WHERE candidate_id = %s"
				execute_query(delete_votes_query, (candidate_id,))

			# Then update to inactive (votes already deleted)
			query = "UPDATE candidates SET is_active = false WHERE user_id = %s"
			execute_query(query, (user_id,))

			return True
		except Exception as e:
			print(f"Error in revoke_candidacy: {str(e)}")
			raise

	@staticmethod
	def reactivate_candidacy(user_id, description=None, candidate_name=None, dob=None, gender=None, party=None, profile_pic=None):
		"""Reactivate an existing inactive candidate with optional data updates"""
		# Check if user has an inactive candidate record
		check_query = "SELECT id, is_active FROM candidates WHERE user_id = %s"
		existing = execute_query(check_query, (user_id,), fetch_one=True)

		if not existing:
			return None  # No candidate record exists

		# Extract is_active status
		if isinstance(existing, dict):
			is_active = existing.get('is_active', False)
			candidate_id = existing.get('id')
		elif isinstance(existing, (tuple, list)) and len(existing) > 1:
			candidate_id = existing[0]
			is_active = existing[1]
		else:
			return None

		if is_active:
			return None  # Already active, shouldn't reactivate

		# Build update query dynamically based on provided fields
		# Votes are already deleted from revoke, so we just reactivate
		update_fields = ["is_active = true"]
		params = []

		if description is not None:
			update_fields.append("description = %s")
			params.append(description)
		
		if candidate_name is not None:
			update_fields.append("name = %s")
			params.append(candidate_name)
		
		if dob is not None:
			update_fields.append("dob = %s")
			params.append(dob)
		
		if gender is not None:
			update_fields.append("gender = %s")
			params.append(gender)
		
		if party is not None:
			update_fields.append("party = %s")
			params.append(party)
		
		if profile_pic is not None:
			update_fields.append("profile_pic = %s")
			params.append(profile_pic)

		params.append(user_id)
		
		query = f"UPDATE candidates SET {', '.join(update_fields)} WHERE user_id = %s"
		execute_query(query, tuple(params))

		return candidate_id

__all__ = ["Candidate"]

