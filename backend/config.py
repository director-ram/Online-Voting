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

	# OAuth (Google)
	GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
	GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
	# Auto-detect backend URL: Render (production) or localhost (development)
	BACKEND_BASE_URL = os.getenv('BACKEND_BASE_URL', os.getenv('RENDER_EXTERNAL_URL', 'http://localhost:5000'))
	GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', f"{BACKEND_BASE_URL}/api/auth/google/callback")
	# Frontend URL for postMessage origin checks - supports both local and production
	# Defaults to '*' (any origin) if not set, useful for local development
	FRONTEND_BASE_URL = os.getenv('FRONTEND_BASE_URL', '*')

__all__ = ['Config']

