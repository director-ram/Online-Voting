from models import execute_query
from datetime import datetime, date


class Vote:
	@staticmethod
	def cast_vote(user_id, candidate_id):
		"""Cast a vote for today"""
		# Check if user has already voted today
		if Vote.has_voted_today(user_id):
			raise Exception("User has already voted today")

		query = """
			INSERT INTO votes (user_id, candidate_id, vote_date)
			VALUES (%s, %s, CURRENT_DATE)
			RETURNING id
		"""
		result = execute_query(query, (user_id, candidate_id), returning=True)
		
		# Extract vote_id from result
		if isinstance(result, dict):
			vote_id = result.get('id')
		elif isinstance(result, (list, tuple)):
			vote_id = result[0] if len(result) > 0 else None
		else:
			vote_id = result
			
		return vote_id

	@staticmethod
	def has_voted(user_id):
		"""Check if user has already voted (deprecated - use has_voted_today)"""
		return Vote.has_voted_today(user_id)
	
	@staticmethod
	def has_voted_today(user_id):
		"""Check if user has already voted today"""
		query = """
			SELECT EXISTS (
				SELECT 1 FROM votes 
				WHERE user_id = %s AND vote_date = CURRENT_DATE
			) AS exists
		"""
		result = execute_query(query, (user_id,), fetch_one=True)
		if isinstance(result, dict):
			return bool(result.get('exists', False))
		if isinstance(result, (list, tuple)):
			return bool(result[0]) if len(result) > 0 else False
		return bool(result)

	@staticmethod
	def get_user_vote(user_id):
		"""Get user's vote information for today"""
		query = """
			SELECT candidate_id, created_at, vote_date
			FROM votes
			WHERE user_id = %s AND vote_date = CURRENT_DATE
		"""
		return execute_query(query, (user_id,), fetch_one=True)
	
	@staticmethod
	def get_user_vote_any_date(user_id):
		"""Get user's most recent vote (any date)"""
		query = """
			SELECT candidate_id, created_at, vote_date
			FROM votes
			WHERE user_id = %s
			ORDER BY vote_date DESC, created_at DESC
			LIMIT 1
		"""
		return execute_query(query, (user_id,), fetch_one=True)

	@staticmethod
	def get_results():
		"""Get voting results for today"""
		query = """
			SELECT 
				c.id as candidateId,
				c.name,
				c.party,
				COUNT(v.id) as votes
			FROM candidates c
			LEFT JOIN votes v ON c.id = v.candidate_id AND v.vote_date = CURRENT_DATE
			GROUP BY c.id, c.name, c.party
			ORDER BY votes DESC, c.name
		"""
		totals = execute_query(query, fetch=True)

		return {
			'totals': totals,
			'lastUpdated': datetime.now().isoformat()
		}
	
	@staticmethod
	def get_results_for_date(target_date):
		"""Get voting results for a specific date"""
		query = """
			SELECT 
				c.id as candidateId,
				c.name,
				c.party,
				COUNT(v.id) as votes
			FROM candidates c
			LEFT JOIN votes v ON c.id = v.candidate_id AND v.vote_date = %s
			GROUP BY c.id, c.name, c.party
			ORDER BY votes DESC, c.name
		"""
		totals = execute_query(query, (target_date,), fetch=True)

		return {
			'totals': totals,
			'date': target_date.isoformat() if isinstance(target_date, date) else target_date,
			'lastUpdated': datetime.now().isoformat()
		}

__all__ = ["Vote"]

