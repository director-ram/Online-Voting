import os
from datetime import timedelta


class Config:
	# Database
	DB_HOST = os.getenv('DB_HOST', 'localhost')
	DB_USER = os.getenv('DB_USER', 'postgres')
	DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
	DB_NAME = os.getenv('DB_NAME', 'voting_system')
	DB_PORT = int(os.getenv('DB_PORT', '5432'))

	# JWT
	JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', os.getenv('SECRET_KEY', 'change-this-secret'))
	JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=4)

__all__ = ['Config']

