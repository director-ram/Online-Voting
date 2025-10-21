from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
import os

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS with environment-based origins
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
CORS(app, resources={
    r"/api/*": {
        "origins": cors_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    },
    r"/uploads/*": {
        "origins": cors_origins
    }
})

# Register blueprints
from routes.auth_routes import auth_bp
from routes.candidate_routes import candidate_bp
from routes.voter_routes import voter_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(candidate_bp, url_prefix='/api/candidates')
app.register_blueprint(voter_bp, url_prefix='/api/voters')

# Serve uploaded files
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads', 'profiles')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/uploads/profiles/<path:filename>')
def serve_upload(filename):
    """Serve uploaded profile pictures"""
    return send_from_directory(UPLOAD_FOLDER, filename)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'ok', 'message': 'Backend is running'}, 200

# Stats endpoint for dashboard
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get voting statistics"""
    try:
        from models import execute_query
        
        # Get counts using direct SQL queries
        total_voters_result = execute_query("SELECT COUNT(*) as count FROM users", fetch_one=True)
        total_candidates_result = execute_query("SELECT COUNT(*) as count FROM candidates WHERE is_active = TRUE", fetch_one=True)
        total_votes_result = execute_query("SELECT COUNT(*) as count FROM votes", fetch_one=True)
        
        # Extract counts (handle dict-like results)
        total_voters = total_voters_result.get('count', 0) if total_voters_result else 0  # type: ignore
        total_candidates = total_candidates_result.get('count', 0) if total_candidates_result else 0  # type: ignore
        total_votes = total_votes_result.get('count', 0) if total_votes_result else 0  # type: ignore
        
        return {
            'totalVoters': total_voters,
            'totalCandidates': total_candidates,
            'totalVotes': total_votes
        }, 200
    except Exception as e:
        print(f"Error getting stats: {e}")
        return {
            'totalVoters': 0,
            'totalCandidates': 0,
            'totalVotes': 0
        }, 200

if __name__ == '__main__':
    print("=" * 80)
    print("🚀 Starting Online Voting System Backend")
    print("=" * 80)
    print(f"📡 Server running on: http://localhost:5000")
    print(f"🔧 Debug mode: {app.config.get('DEBUG', False)}")
    print("=" * 80)
    app.run(debug=True, host='0.0.0.0', port=5000)
