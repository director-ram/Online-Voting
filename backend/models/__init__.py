import psycopg2
import psycopg2.extras
from config import Config


def get_db_connection():
	"""Create and return a PostgreSQL database connection"""
	connection = psycopg2.connect(
		host=Config.DB_HOST,
		user=Config.DB_USER,
		password=Config.DB_PASSWORD,
		dbname=Config.DB_NAME,
		port=Config.DB_PORT
	)
	return connection


def execute_query(query, params=None, fetch=False, fetch_one=False, returning=False):
	"""Execute a database query with optional parameters.
	- fetch/fetch_one use RealDictCursor for dict-like results
	- returning: for INSERT/UPDATE with RETURNING ...
	"""
	connection = None
	cursor = None
	try:
		connection = get_db_connection()
		cursor_factory = psycopg2.extras.RealDictCursor if (fetch or fetch_one or returning) else None
		cursor = connection.cursor(cursor_factory=cursor_factory)
		cursor.execute(query, params or ())

		if fetch_one:
			result = cursor.fetchone()
		elif fetch:
			result = cursor.fetchall()
		elif returning:
			result = cursor.fetchone()
			connection.commit()
		else:
			connection.commit()
			result = cursor.rowcount
		return result
	except psycopg2.Error:
		if connection:
			connection.rollback()
		raise
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()

__all__ = ['get_db_connection', 'execute_query']
